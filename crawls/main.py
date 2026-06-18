import os
import re
import sys
import time
import json
import random
import argparse
from datetime import datetime
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse, urljoin
from curl_cffi import requests
from bs4 import BeautifulSoup

# Reconfigure stdout to support Vietnamese UTF-8 output in consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DEFAULT_SEARCH_URL = (
    "https://www.topcv.vn/tim-viec-lam-cong-nghe-thong-tin-cr257"
    "?type_keyword=1&sba=1&category_family=r257"
)

def log(msg, level="INFO"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {msg}")

def get_page_url(base_url, page_number):
    """
    Safely injects or updates the 'page' query parameter in the search URL
    to maintain all other filter query parameters.
    """
    url_parts = list(urlparse(base_url))
    query = parse_qs(url_parts[4])
    query['page'] = [str(page_number)]
    url_parts[4] = urlencode(query, doseq=True)
    return urlunparse(url_parts)

def extract_job_id(url):
    """
    Extracts the unique job ID from TopCV job URL.
    Example: https://www.topcv.vn/viec-lam/ten-cong-viec/123456.html -> 123456
    """
    match = re.search(r"/(\d+)\.html", url)
    if match:
        return match.group(1)
    
    # Try generic numbers
    match = re.search(r"/(\d+)(?:\?|$)", url)
    if match:
        return match.group(1)
    
    # Fallback to hash of URL
    import hashlib
    return hashlib.md5(url.encode('utf-8')).hexdigest()[:12]

def clean_job_url(url):
    """
    Removes tracking parameters from the job URL.
    """
    url_parts = list(urlparse(url))
    # We drop all query params on detail page to have clean URLs
    url_parts[4] = ""
    return urlunparse(url_parts)

def parse_job_detail(html, url, job_id):
    """
    Parses detailed information from a job HTML page.
    Supports standard layout with a robust fallback for other custom templates.
    """
    soup = BeautifulSoup(html, "html.parser")
    data = {
        "id": job_id,
        "url": url,
        "crawled_at": datetime.utcnow().isoformat() + "Z"
    }

    # 1. Title
    title_elem = soup.find(class_="job-detail__info--title") or soup.find("h1") or soup.find(class_="job-detail-info-title")
    data["title"] = title_elem.get_text(strip=True) if title_elem else "Không xác định"

    # 2. Company Name
    company_elem = (
        soup.find(class_="company-name-label") or 
        soup.find(class_="company-name") or 
        soup.find("a", class_="company-name-label") or
        soup.find(class_="job-detail__company--information-item company-name")
    )
    if not company_elem:
        # Fallback search for company links/headers
        company_elem = soup.find(class_=lambda x: x and "company" in x and "name" in x)
    data["company_name"] = company_elem.get_text(strip=True) if company_elem else "Không xác định"

    # 3. Salary
    salary_elem = soup.find(class_="section-salary")
    if salary_elem:
        val = salary_elem.find(class_="job-detail__info--section-content-value")
        data["salary"] = val.get_text(strip=True) if val else salary_elem.get_text(strip=True)
    else:
        # Fallback searching in list items or text containing "Mức lương"
        data["salary"] = "Thỏa thuận"

    # 4. Location
    loc_elem = soup.find(class_="section-location")
    if loc_elem:
        val = loc_elem.find(class_="job-detail__info--section-content-value")
        data["location"] = val.get_text(strip=True) if val else loc_elem.get_text(strip=True)
    else:
        data["location"] = "Không xác định"

    # 5. Experience
    exp_elem = soup.find(class_="section-experience")
    if exp_elem:
        val = exp_elem.find(class_="job-detail__info--section-content-value")
        data["experience"] = val.get_text(strip=True) if val else exp_elem.get_text(strip=True)
    else:
        data["experience"] = "Không yêu cầu kinh nghiệm"

    # 6. Deadline
    deadline_elem = soup.find(class_="job-detail__info--deadline-date") or soup.find(class_="job-detail__info--deadline")
    data["deadline"] = deadline_elem.get_text(strip=True) if deadline_elem else "Không xác định"

    # 7. Description, Requirements, Benefits
    desc_elem = soup.find(class_="job-detail__information-detail--content") or soup.find(class_="job-description__item description")
    data["description"] = desc_elem.get_text("\n", strip=True) if desc_elem else ""

    req_elem = soup.find(class_="requirement") or soup.find(class_="job-description__item requirement") or soup.find(class_=lambda x: x and "requirement" in x)
    data["requirements"] = req_elem.get_text("\n", strip=True) if req_elem else ""

    ben_elem = soup.find(class_="benefit") or soup.find(class_="job-description__item benefit") or soup.find(class_=lambda x: x and "benefit" in x)
    data["benefits"] = ben_elem.get_text("\n", strip=True) if ben_elem else ""

    # If description, requirements and benefits are still empty, try to extract whole body text or key block
    if not data["description"] and not data["requirements"]:
        main_content = soup.find(class_="job-detail__information-container") or soup.find(id="job-detail") or soup.find("main")
        if main_content:
            data["description"] = main_content.get_text("\n", strip=True)
        else:
            data["description"] = soup.get_text("\n", strip=True)

    # 8. Company metadata
    scale_elem = soup.find(class_="company-scale")
    if scale_elem:
        val = scale_elem.find(class_="company-value")
        data["company_scale"] = val.get_text(strip=True) if val else scale_elem.get_text(strip=True)
    else:
        data["company_scale"] = "Không xác định"

    field_elem = soup.find(class_="company-field")
    if field_elem:
        val = field_elem.find(class_="company-value")
        data["company_field"] = val.get_text(strip=True) if val else field_elem.get_text(strip=True)
    else:
        data["company_field"] = "Không xác định"

    # 8.1 Job Industry (Lĩnh vực công việc)
    job_industry = ""
    try:
        for s in soup.find_all("script", type="application/ld+json"):
            if s.string and "JobPosting" in s.string:
                ld_data = json.loads(s.string)
                ind = ld_data.get("industry")
                if ind:
                    job_industry = ind
                    break
    except Exception:
        pass

    if not job_industry:
        for div in soup.find_all(class_="box-category"):
            title_elem = div.find(class_="box-title")
            if title_elem:
                t_text = title_elem.get_text().lower()
                if any(k in t_text for k in ["danh mục", "ngành nghề", "nghề liên quan"]):
                    tags = [a.get_text(strip=True) for a in div.find_all("a")]
                    if tags:
                        job_industry = ", ".join(tags)
                        break

    data["industry"] = job_industry or "Không xác định"

    addr_elem = soup.find(class_="company-address")
    if addr_elem:
        val = addr_elem.find(class_="company-value")
        data["company_address"] = val.get_text(strip=True) if val else addr_elem.get_text(strip=True)
    else:
        data["company_address"] = "Không xác định"

    # 9. General info metadata
    general_info = {}
    for item in soup.find_all(class_="box-general-group-info"):
        title = item.find(class_="box-general-group-info-title")
        val = item.find(class_="box-general-group-info-value")
        if title and val:
            t_str = title.get_text(strip=True).replace(":", "")
            v_str = val.get_text(strip=True)
            general_info[t_str] = v_str

    data["rank"] = general_info.get("Cấp bậc", "Không xác định")
    data["management_experience"] = general_info.get("Kinh nghiệm quản lý", "Không xác định")
    data["education"] = general_info.get("Học vấn", "Không xác định")
    data["vacancies"] = general_info.get("Số lượng tuyển", "Không xác định")
    data["working_style"] = general_info.get("Hình thức làm việc", "Không xác định")
    data["job_type"] = general_info.get("Loại hình làm việc", "Không xác định")

    # 10. Avatar / Logo extraction
    avatar_url = ""
    # Try Method 1: JSON-LD hiringOrganization logo
    try:
        for s in soup.find_all("script", type="application/ld+json"):
            if s.string and "hiringOrganization" in s.string:
                ld_data = json.loads(s.string)
                logo = ld_data.get("hiringOrganization", {}).get("logo")
                if logo:
                    avatar_url = logo
                    break
    except Exception:
        pass

    # Try Method 2: Fallback on .company-logo or .box-company-logo img tag
    if not avatar_url:
        logo_container = soup.find(class_="company-logo") or soup.find(class_="box-company-logo")
        if logo_container:
            img = logo_container.find("img")
            if img:
                for attr in ["src", "data-src", "data-original", "data-lazy-src"]:
                    val = img.get(attr)
                    if val:
                        avatar_url = val
                        break

    # Try Method 3: Fallback on any img with company_logos or logo keywords
    if not avatar_url:
        for img in soup.find_all("img"):
            for attr in ["src", "data-src", "data-original"]:
                val = img.get(attr)
                if val and ("company_logos" in val or "logo" in val.lower() or "avatar" in val.lower()):
                    if "topcv-logo" not in val and "toppy_denny" not in val:
                        avatar_url = val
                        break
            if avatar_url:
                break

    data["avatar"] = avatar_url

    return data

def request_with_retry(session, url, args, proxy_list=None, current_proxy_idx=None, impersonate="chrome120"):
    """
    Performs a GET request using session.get.
    If 429 Too Many Requests is received, waits with exponential backoff and retries up to max_retries.
    If proxy_list is provided, changes/rotates the proxy on each retry.
    """
    max_retries = getattr(args, "max_retries", 3)
    initial_delay = 5.0
    backoff_factor = 2.0
    
    for attempt in range(max_retries + 1):
        proxies = None
        if proxy_list and current_proxy_idx is not None:
            p_str = proxy_list[current_proxy_idx[0]]
            proxies = {"http": p_str, "https": p_str}
            
        try:
            if proxies:
                log(f"Using proxy: {proxies['http']}")
                response = session.get(url, impersonate=impersonate, proxies=proxies, timeout=15)
            else:
                response = session.get(url, impersonate=impersonate, timeout=15)
                
            if response.status_code == 200:
                return response
                
            if response.status_code == 429:
                if attempt == max_retries:
                    log(f"Failed to fetch after {max_retries} retries due to 429 Too Many Requests.", "ERROR")
                    return response
                
                sleep_time = initial_delay * (backoff_factor ** attempt) + random.uniform(1.0, 3.0)
                log(f"Received 429 Too Many Requests. Retrying in {sleep_time:.2f} seconds (Attempt {attempt+1}/{max_retries})...", "WARNING")
                
                # Switch to next proxy if rotating proxies
                if proxy_list and current_proxy_idx is not None:
                    current_proxy_idx[0] = (current_proxy_idx[0] + 1) % len(proxy_list)
                    log(f"Rotating proxy to next index: {current_proxy_idx[0]}", "INFO")
                    
                time.sleep(sleep_time)
                continue
            else:
                log(f"Request failed with status: {response.status_code}", "WARNING")
                return response
                
        except Exception as e:
            if attempt == max_retries:
                log(f"Request exception after {max_retries} retries: {e}", "ERROR")
                raise e
            
            sleep_time = initial_delay * (backoff_factor ** attempt) + random.uniform(1.0, 3.0)
            log(f"Exception encountered: {e}. Retrying in {sleep_time:.2f} seconds...", "WARNING")
            
            if proxy_list and current_proxy_idx is not None:
                current_proxy_idx[0] = (current_proxy_idx[0] + 1) % len(proxy_list)
                log(f"Rotating proxy to next index due to connection failure: {current_proxy_idx[0]}", "INFO")
                
            time.sleep(sleep_time)
            
    return None

def main():
    parser = argparse.ArgumentParser(description="TopCV Sales/Business Development Job Crawler")
    parser.add_argument("--url", type=str, default=DEFAULT_SEARCH_URL, help="TopCV search page entry URL")
    parser.add_argument("--max-pages", type=int, default=5, help="Maximum search pages to scrape")
    parser.add_argument("--max-jobs", type=int, default=100, help="Maximum jobs to scrape")
    parser.add_argument("--delay-min", type=float, default=1.5, help="Minimum delay (seconds) between requests")
    parser.add_argument("--delay-max", type=float, default=3.5, help="Maximum delay (seconds) between requests")
    parser.add_argument("--max-retries", type=int, default=3, help="Maximum retry attempts on 429 or connection failures")
    parser.add_argument("--proxy", type=str, default=None, help="Single proxy URL (e.g. http://username:password@ip:port)")
    parser.add_argument("--proxy-file", type=str, default=None, help="Path to a text file containing proxies (one per line)")
    parser.add_argument("--output-dir", type=str, default="data", help="Directory where crawled JSONs will be saved")
    args = parser.parse_args()

    # Ensure output directory exists (relative to script location or absolute)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, args.output_dir)
    os.makedirs(output_path, exist_ok=True)

    # Initialize proxies
    proxy_list = []
    if args.proxy:
        proxy_list.append(args.proxy)
    if args.proxy_file:
        if os.path.exists(args.proxy_file):
            with open(args.proxy_file, "r", encoding="utf-8") as f:
                for line in f:
                    p = line.strip()
                    if p and not p.startswith("#"):
                        proxy_list.append(p)
            log(f"Loaded {len(proxy_list)} proxies from {args.proxy_file}")
        else:
            log(f"Proxy file {args.proxy_file} not found. Running without file proxies.", "WARNING")

    current_proxy_idx = [0] if proxy_list else None

    log(f"Starting crawler. Outputs will be saved to: {output_path}")
    log(f"Parameters: --max-pages={args.max_pages}, --max-jobs={args.max_jobs}, --delay-min={args.delay_min}, --delay-max={args.delay_max}, --max-retries={args.max_retries}")
    if proxy_list:
        log(f"Using proxy list rotation with {len(proxy_list)} total proxy configurations.")

    # Use curl_cffi requests to impersonate browser and bypass Cloudflare
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    })

    job_urls = []
    page = 1
    
    # Phase 1: Collect Job Links
    log("=== PHASE 1: COLLECTING JOB LINKS ===")
    while page <= args.max_pages and len(job_urls) < args.max_jobs:
        target_page_url = get_page_url(args.url, page)
        log(f"Fetching listing page {page}: {target_page_url}")
        
        try:
            response = request_with_retry(session, target_page_url, args, proxy_list, current_proxy_idx)
            if not response or response.status_code != 200:
                log(f"Failed to fetch listing page {page}. Status: {response.status_code if response else 'No Response'}", "ERROR")
                break
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Find job link anchor tags
            found_on_page = 0
            for a in soup.find_all("a", href=True):
                href = a["href"]
                # Filter for detail pages
                if "/viec-lam/" in href:
                    clean_url = clean_job_url(urljoin(target_page_url, href))
                    if clean_url not in job_urls:
                        job_urls.append(clean_url)
                        found_on_page += 1
                        if len(job_urls) >= args.max_jobs:
                            break
                            
            log(f"Page {page}: found {found_on_page} new job links. Cumulative unique links: {len(job_urls)}")
            
            # Check if there is next pagination block
            # If no pagination links exist or we are on the last page, we stop
            pagination_div = soup.find(class_="pagination") or soup.find(class_="box-pagination")
            if not pagination_div:
                log("No pagination element found. Stopping listing traversal.")
                break
                
            next_btn = pagination_div.find("a", rel="next")
            if not next_btn:
                log("No 'rel=next' button found. Reached the last page.")
                break
                
        except Exception as e:
            log(f"Exception while scraping listing page {page}: {e}", "ERROR")
            break
            
        page += 1
        # Random sleep between page loads
        time.sleep(random.uniform(args.delay_min, args.delay_max))

    log(f"Completed collection phase. Found {len(job_urls)} jobs in total.")

    # Phase 2: Crawl Detailed Info for each Job
    log("=== PHASE 2: CRAWLING JOB DETAILS ===")
    crawled_count = 0
    skipped_count = 0
    failed_count = 0

    for idx, job_url in enumerate(job_urls):
        job_id = extract_job_id(job_url)
        file_name = f"{job_id}.json"
        file_path = os.path.join(output_path, file_name)

        # Resume feature: skip if file already exists
        if os.path.exists(file_path):
            log(f"[{idx+1}/{len(job_urls)}] Skipping {job_id} (already crawled).")
            skipped_count += 1
            continue

        log(f"[{idx+1}/{len(job_urls)}] Fetching job detail: {job_url}")
        
        try:
            # Polite scraping delay
            time.sleep(random.uniform(args.delay_min, args.delay_max))
            
            response = request_with_retry(session, job_url, args, proxy_list, current_proxy_idx)
            if not response or response.status_code != 200:
                log(f"Failed to fetch job {job_id}. Status: {response.status_code if response else 'No Response'}", "WARNING")
                failed_count += 1
                continue
                
            job_data = parse_job_detail(response.text, job_url, job_id)
            
            # Save detail data immediately
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(job_data, f, ensure_ascii=False, indent=2)
                
            log(f"Successfully scraped and saved job: '{job_data.get('title')}' at '{job_data.get('company_name')}'")
            crawled_count += 1
            
        except Exception as e:
            log(f"Exception crawling detail {job_url}: {e}", "ERROR")
            failed_count += 1

    # Print summary
    log("=== CRAWLING COMPLETED ===")
    log(f"Total Unique URLs found: {len(job_urls)}")
    log(f"New Jobs Crawled: {crawled_count}")
    log(f"Jobs Skipped (already existed): {skipped_count}")
    log(f"Jobs Failed: {failed_count}")

if __name__ == "__main__":
    main()
