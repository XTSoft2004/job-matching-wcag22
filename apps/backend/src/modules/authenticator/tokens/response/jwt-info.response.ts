export class JWTInfoResponse {
  /**
   * ID duy nhất của bản ghi (Khóa chính).
   */
  id: number;
  /**
   * Sub.
   */
  sub: string;
  /**
   * Username.
   */
  username: string; // Chứa email người dùng
  /**
   * Vai trò người dùng trong hệ thống (Ứng viên, Nhà tuyển dụng, Admin).
   */
  role: string;
  /**
   * Mã định danh thiết bị đăng nhập.
   */
  deviceId: string;
  /**
   * Exp.
   */
  exp: number; // Hạn dùng dạng Unix Epoch timestamp (giây)
  /**
   * Expired At.
   */
  expiredAt: Date; // Hạn dùng dạng đối tượng Date
}
