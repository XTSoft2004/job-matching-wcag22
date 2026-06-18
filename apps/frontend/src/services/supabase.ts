import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://epc-9d-6-posjerpx0ny7q.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ePC_9d-6-pOsJERpX0Ny7Q_KpEnof2y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Tải file CV lên Supabase Storage trong bucket "cv-images"
 * @param file Đối tượng tệp tin cần tải lên
 * @returns Đường dẫn URL công khai để truy cập file
 */
export const uploadCvToSupabase = async (file: File): Promise<string> => {
  // Tạo tên file duy nhất bằng timestamp và chuỗi ngẫu nhiên để tránh trùng lặp
  const fileExt = file.name.split('.').pop();
  const cleanFileName = file.name
    .replace(`.${fileExt}`, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);
  const uniqueName = `${Date.now()}_${cleanFileName}.${fileExt}`;

  // Tải tệp lên bucket "cv-images" ở thư mục gốc
  const { error } = await supabase.storage
    .from('cv-images')
    .upload(uniqueName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Lỗi khi tải file lên Supabase:', error);
    throw new Error(`Tải file lên Supabase thất bại: ${error.message}`);
  }

  // Lấy Public URL của tệp vừa upload
  const { data: { publicUrl } } = supabase.storage
    .from('cv-images')
    .getPublicUrl(uniqueName);

  return publicUrl;
};
