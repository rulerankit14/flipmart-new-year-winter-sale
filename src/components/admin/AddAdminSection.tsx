import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, UserPlus, Loader2, Mail, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

interface AddAdminSectionProps {
  adminPasswordStep: 'email' | 'password';
  newAdminEmail: string;
  setNewAdminEmail: (email: string) => void;
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  handleValidateNewAdmin: () => void;
  handleVerifyAndAddAdmin: () => void;
  resetAdminForm: () => void;
  verifyingPassword: boolean;
  addingAdmin: boolean;
  userEmail?: string;
}

const AddAdminSection: React.FC<AddAdminSectionProps> = ({
  adminPasswordStep,
  newAdminEmail,
  setNewAdminEmail,
  adminPassword,
  setAdminPassword,
  handleValidateNewAdmin,
  handleVerifyAndAddAdmin,
  resetAdminForm,
  verifyingPassword,
  addingAdmin,
  userEmail,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <Label className="text-base font-semibold">Add New Admin</Label>
      
      {adminPasswordStep === 'email' ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="new_admin_email">New Admin Email</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="new_admin_email"
                  type="email"
                  placeholder="Enter email address"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidateNewAdmin()}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button onClick={handleValidateNewAdmin} disabled={verifyingPassword || !newAdminEmail.trim()}>
                {verifyingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Continue
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the email of the user you want to make an admin. They must have signed up first.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm">
              Adding admin: <strong>{newAdminEmail}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your password to confirm this action
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin_password">Your Password</Label>
            <div className="relative">
              <Input
                id="admin_password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyAndAddAdmin()}
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={resetAdminForm}
              disabled={addingAdmin}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyAndAddAdmin} 
              disabled={addingAdmin || !adminPassword.trim()}
              className="flex-1"
            >
              {addingAdmin ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Confirm & Add
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAdminSection;
