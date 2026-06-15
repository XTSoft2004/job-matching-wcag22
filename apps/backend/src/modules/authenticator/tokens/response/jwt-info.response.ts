export class JWTInfoResponse {
  id: number;
  sub: string;
  username: string; // Chứa email người dùng
  role: string;
  deviceId: string;
  exp: number; // Hạn dùng dạng Unix Epoch timestamp (giây)
  expiredAt: Date; // Hạn dùng dạng đối tượng Date
}
