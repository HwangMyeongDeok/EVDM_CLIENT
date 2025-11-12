import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  Save,
} from "lucide-react";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/features/admin/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/features/auth/authSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IUser } from "@/types/user";
import instance from "@/lib/axios"; // THÊM DÒNG NÀY
import type { IDealer } from "@/types/dealer";


export default function UserManagementPage() {
  const {
    data: users = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const { user: currentUser } = useAppSelector(selectAuth);

  // State cho danh sách đại lý
  const [dealers, setDealers] = useState<IDealer[]>([]);
  const [loadingDealers, setLoadingDealers] = useState(true);

  // LẤY DANH SÁCH ĐẠI LÝ – GIỐNG HỆT CÁI CONTRACT CỦA BẠN
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoadingDealers(true);
        const res = await instance.get(`/dealers`);
        const data = res.data.data;
        console.log("Danh sách đại lý tải về:", data);
        setDealers(data || []);
      } catch (err) {
        console.error("Lỗi tải danh sách đại lý:", err);
        toast.error("Lỗi tải danh sách đại lý");
        setDealers([]);
      } finally {
        setLoadingDealers(false);
      }
    };
    fetchDealers();
  }, []);

  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "DEALER_STAFF",
    dealerId: "", 
    phone: "",
  });


  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    role: "",
    dealer_id: "",
    password: "",
  });


  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);

  const isTargetAdmin = (role: string) => role === "ADMIN";

  const handleEditClick = (user: IUser) => {
    if (isTargetAdmin(user.role)) {
      toast.info("Không thể chỉnh sửa tài khoản Admin.");
      return;
    }
    setUserToEdit(user);
    setEditForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
      role: user.role,
      dealer_id: user.dealer_id ? String(user.dealer_id) : "",
      password: "",
    });
    setIsEditModalOpen(true);
  };


  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    const body: any = {
      full_name: editForm.full_name,
      phone: editForm.phone,
      role: editForm.role,
    };

    if (editForm.password) body.password = editForm.password;

    if (editForm.role === "DEALER_STAFF" || editForm.role === "DEALER_MANAGER") {
      if (!editForm.dealer_id) {
        toast.error("Vui lòng chọn Đại lý.");
        return;
      }
      body.dealer_id = Number(editForm.dealer_id);
    } else {
      body.dealer_id = null;
    }

    Object.keys(body).forEach(key => {
      if (body[key] === "" || body[key] === undefined) delete body[key];
    });

    try {
      await updateUser({ id: userToEdit.user_id, body }).unwrap();
      toast.success(`Cập nhật người dùng ID: ${userToEdit.user_id} thành công.`);
      setIsEditModalOpen(false);
      setUserToEdit(null);
    } catch (err: any) {
      const errMsg = err.data?.message || "Cập nhật thất bại.";
      toast.error(errMsg);
    }
  };

 
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserForm.email || !newUserForm.password || !newUserForm.fullName) {
      toast.error("Vui lòng điền đủ Email, Mật khẩu và Họ tên.");
      return;
    }

    let dealerIdValue: number | null = null;
    if (newUserForm.role === "DEALER_STAFF" || newUserForm.role === "DEALER_MANAGER") {
      if (!newUserForm.dealerId) {
        toast.error("Vui lòng chọn Đại lý.");
        return;
      }
      dealerIdValue = Number(newUserForm.dealerId);
    }

    const payload = {
      email: newUserForm.email,
      password: newUserForm.password,
      full_name: newUserForm.fullName,
      role: newUserForm.role,
      dealer_id: dealerIdValue,
      phone: newUserForm.phone || undefined,
    };

    try {
      await createUser(payload as any).unwrap();
      toast.success(`Tài khoản ${newUserForm.email} đã được tạo thành công.`);
      setNewUserForm({
        email: "", password: "", fullName: "", role: "DEALER_STAFF", dealerId: "", phone: "",
      });
      setIsNewUserModalOpen(false);
    } catch (err: any) {
      const errMsg = err.data?.message || "Tạo người dùng thất bại.";
      toast.error(errMsg);
    }
  };

 
  const handleDeleteConfirm = async () => {
    if (!userToDeleteId) return;
    try {
      await deleteUser(userToDeleteId).unwrap();
      toast.success("Đã xóa người dùng thành công.");
      setUserToDeleteId(null);
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "Xóa thất bại.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            Quản lý Người dùng ({users.length})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching || isDeleting || isCreating || isUpdating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
            <Button onClick={() => setIsNewUserModalOpen(true)} disabled={isDeleting || isUpdating}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Người dùng
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Vai trò (Role)</TableHead>
                <TableHead>Đại lý ID</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.user_id}</TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.full_name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={isTargetAdmin(user.role) ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.dealer_id || "—"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isTargetAdmin(user.role) || isDeleting || isCreating || isUpdating}
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isTargetAdmin(user.role) || isDeleting || isCreating || isUpdating}
                      onClick={() => {
                        if (!isTargetAdmin(user.role)) {
                          setUserToDeleteId(user.user_id);
                          setIsDeleteDialogOpen(true);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Không tìm thấy người dùng nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL THÊM – DROPDOWN ĐẠI LÝ */}
      <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm Người dùng mới</DialogTitle>
            <DialogDescription>Tạo tài khoản mới và gán vai trò phù hợp.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vd: user@evdm.com"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="nhập mật khẩu"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                placeholder="vd: Nguyễn Văn A"
                value={newUserForm.fullName}
                onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                placeholder="vd: 090xxxxxxx"
                value={newUserForm.phone}
                onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Vai trò (Role)</Label>
              <Select
                value={newUserForm.role}
                onValueChange={(value) =>
                  setNewUserForm({ ...newUserForm, role: value, dealerId: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEALER_STAFF">DEALER_STAFF</SelectItem>
                  <SelectItem value="DEALER_MANAGER">DEALER_MANAGER</SelectItem>
                  <SelectItem value="EVM_STAFF">EVM_STAFF</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DROPDOWN ĐẠI LÝ */}
            {(newUserForm.role === "DEALER_STAFF" || newUserForm.role === "DEALER_MANAGER") && (
              <div className="space-y-2">
                <Label>Chọn Đại lý</Label>
                <Select
                  value={newUserForm.dealerId}
                  onValueChange={(value) => setNewUserForm({ ...newUserForm, dealerId: value })}
                  disabled={loadingDealers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDealers ? "Đang tải đại lý..." : "Chọn đại lý"} />
                  </SelectTrigger>
                  <SelectContent>
                    {dealers.length === 0 ? (
                      <SelectItem value="none" disabled>Không có đại lý</SelectItem>
                    ) : (
                      dealers.map((dealer) => (
                        <SelectItem key={dealer.dealer_id} value={String(dealer.dealer_id)}>
                          {dealer.dealer_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setIsNewUserModalOpen(false)} disabled={isCreating}>
                Hủy
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isCreating ? "Đang lưu..." : "Lưu Người dùng"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL SỬA – DROPDOWN ĐẠI LÝ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Người dùng ID: {userToEdit?.user_id}</DialogTitle>
            <DialogDescription>Cập nhật thông tin tài khoản.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Email (Không sửa)</Label>
              <Input type="email" value={userToEdit?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu mới</Label>
              <Input
                type="password"
                placeholder="Để trống nếu không thay đổi"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Vai trò (Role)</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value, dealer_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEALER_STAFF">DEALER_STAFF</SelectItem>
                  <SelectItem value="DEALER_MANAGER">DEALER_MANAGER</SelectItem>
                  <SelectItem value="EVM_STAFF">EVM_STAFF</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DROPDOWN ĐẠI LÝ TRONG SỬA */}
            {(editForm.role === "DEALER_STAFF" || editForm.role === "DEALER_MANAGER") && (
              <div className="space-y-2">
                <Label>Chọn Đại lý</Label>
                <Select
                  value={editForm.dealer_id}
                  onValueChange={(value) => setEditForm({ ...editForm, dealer_id: value })}
                  disabled={loadingDealers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDealers ? "Đang tải..." : "Chọn đại lý"} />
                  </SelectTrigger>
                  <SelectContent>
                    {dealers.map((dealer) => (
                      <SelectItem key={dealer.dealer_id} value={String(dealer.dealer_id)}>
                        {dealer.dealer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating}>
                Hủy
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Xóa */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận Xóa Người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng ID: {userToDeleteId}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}