"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Edit3, Mail, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';

import PublicLayout from '@/components/PublicLayout';

interface UserProfile {
  name: string;
  email: string;
  verified: boolean;
  id: string;
  mobile?: string;
  alternateMobile?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

const ProfilePage = () => {
  const { isLoggedIn, user, token } = useStore((s) => ({ 
    isLoggedIn: s.isLoggedIn, 
    user: s.user, 
    token: s.token 
  }));
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
  
  // Initialize profile data from logged-in user
  const [profileData, setProfileData] = useState<UserProfile>(() => ({
    name: user?.name || '',
    email: user?.email || '',
    verified: user?.verified || false,
    id: user?.id || '',
    mobile: user?.mobile || '',
    alternateMobile: user?.alternateMobile || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || ''
  }));

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        verified: user.verified || false,
        id: user.id || '',
        mobile: user.mobile || '',
        alternateMobile: user.alternateMobile || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);



  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveMessage('');

    const normalizeOptionalString = (value: unknown) => {
      const s = String(value ?? '').trim();
      return s.length > 0 ? s : '';
    };

    const digitsOnly = (value: unknown) => normalizeOptionalString(value).replace(/\D/g, '');

    const validateProfile = () => {
      const errors: Partial<Record<keyof UserProfile, string>> = {};

      const mobileDigits = digitsOnly(profileData.mobile);
      const altDigits = digitsOnly(profileData.alternateMobile);
      const pincodeDigits = digitsOnly(profileData.pincode);
      const address = normalizeOptionalString(profileData.address);
      const city = normalizeOptionalString(profileData.city);

      if (mobileDigits && mobileDigits.length !== 10) {
        errors.mobile = 'Mobile Number must be exactly 10 digits';
      }
      if (altDigits && altDigits.length !== 10) {
        errors.alternateMobile = 'Alternate Mobile must be exactly 10 digits';
      }
      if (mobileDigits && altDigits && mobileDigits === altDigits) {
        errors.alternateMobile = 'Alternate Mobile must be different from Mobile Number';
      }

      if (address && (address.length < 5 || address.length > 250)) {
        errors.address = 'Address must be between 5 and 250 characters';
      }

      if (city && (city.length < 2 || city.length > 60 || !/^[a-zA-Z\s.\-']+$/.test(city))) {
        errors.city = 'City must be 2-60 characters and contain only letters';
      }

      if (pincodeDigits && pincodeDigits.length !== 6) {
        errors.pincode = 'Pincode must be exactly 6 digits';
      }

      return errors;
    };

    const errors = validateProfile();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSaveMessage('Please fix the highlighted fields before saving.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Get token from store or localStorage
      const storedToken = token || localStorage.getItem('token');
      
      if (!storedToken) {
        setSaveMessage('Error: No authentication token found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        // Update the user in the store
        const { login } = useStore.getState();
        login(updatedUser, storedToken);
        
        setSaveMessage('Profile updated successfully!');
        setTimeout(() => {
          setSaveMessage('');
          setIsEditing(false);
        }, 2000);
      } else {
        const error = await response.json();
        setSaveMessage(`Error: ${error.error || 'Failed to update profile'}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setSaveMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-4">My Profile</h1>
        <p className="text-base text-muted-foreground mb-4">You need to login to view profile details.</p>
        <Link href="/login" className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          Go to Login
        </Link>
      </div>
    </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto py-16 px-4 min-h-screen">

        {/* Main Profile Container */}
        <div className="transition-all duration-300 ease-out">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-peacock-teal to-royal-purple bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-muted-foreground text-lg">Manage your account settings and preferences</p>
            </div>

            {/* Profile Card */}
            <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-peacock-teal/5 animate-fade-in card-hover">
              <div className="gradient-peacock h-2"></div>
              <CardHeader className="pb-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Profile Image */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-peacock-teal to-royal-purple p-1 shadow-xl transform transition-all duration-300 group-hover:scale-105">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <User className="w-16 h-16 text-peacock-teal" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-saffron rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-2 text-foreground">{profileData.name}</h2>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      <Badge variant={profileData.verified ? "default" : "secondary"} className="px-3 py-1">
                        {profileData.verified ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Verified</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> Not Verified</>
                        )}
                      </Badge>
                      <Badge variant="outline" className="border-peacock-teal text-peacock-teal">
                        ID: {profileData.id.slice(0, 8)}...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{profileData.email}</span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="flex gap-2">
                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                      <DialogTrigger asChild>
                        <Button className="bg-saffron hover:bg-saffron/90 text-white shadow-lg transform transition-all duration-300 hover:scale-105">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-peacock-teal to-royal-purple bg-clip-text text-transparent">
                            Edit Profile
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                          <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="basic">Basic Info</TabsTrigger>
                              <TabsTrigger value="contact">Contact Details</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="basic" className="space-y-4">
                              <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                  id="name"
                                  value={profileData.name}
                                  onChange={(e) => handleInputChange('name', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={profileData.email}
                                  onChange={(e) => handleInputChange('email', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="contact" className="space-y-4">
                              <div>
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                  id="mobile"
                                  type="tel"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={10}
                                  placeholder="10-digit mobile number"
                                  value={profileData.mobile}
                                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                                  className="mt-1"
                                />
                                {fieldErrors.mobile && (
                                  <p className="mt-1 text-xs text-destructive">{fieldErrors.mobile}</p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="alternateMobile">Alternate Mobile</Label>
                                <Input
                                  id="alternateMobile"
                                  type="tel"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={10}
                                  placeholder="10-digit alternate number"
                                  value={profileData.alternateMobile}
                                  onChange={(e) => handleInputChange('alternateMobile', e.target.value)}
                                  className="mt-1"
                                />
                                {fieldErrors.alternateMobile && (
                                  <p className="mt-1 text-xs text-destructive">{fieldErrors.alternateMobile}</p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                  id="address"
                                  value={profileData.address}
                                  onChange={(e) => handleInputChange('address', e.target.value)}
                                  className="mt-1"
                                  rows={3}
                                />
                                {fieldErrors.address && (
                                  <p className="mt-1 text-xs text-destructive">{fieldErrors.address}</p>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="city">City</Label>
                                  <Input
                                    id="city"
                                    value={profileData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className="mt-1"
                                  />
                                  {fieldErrors.city && (
                                    <p className="mt-1 text-xs text-destructive">{fieldErrors.city}</p>
                                  )}
                                </div>
                                <div>
                                  <Label htmlFor="pincode">Pincode</Label>
                                  <Input
                                    id="pincode"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    placeholder="6-digit pincode"
                                    value={profileData.pincode}
                                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                                    className="mt-1"
                                  />
                                  {fieldErrors.pincode && (
                                    <p className="mt-1 text-xs text-destructive">{fieldErrors.pincode}</p>
                                  )}
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                          
                          <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1 bg-peacock-teal hover:bg-peacock-teal/90" disabled={isLoading}>
                              {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                              Cancel
                            </Button>
                          </div>
                          
                          {saveMessage && (
                            <div className={`mt-4 p-3 rounded-md text-sm ${
                              saveMessage.includes('success') 
                                ? 'bg-green-50 text-green-800 border border-green-200' 
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                              {saveMessage}
                            </div>
                          )}
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <Card className="shadow-md border border-border/50 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Phone className="w-5 h-5 text-peacock-teal" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Mobile</span>
                        <span className="font-medium">{profileData.mobile || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Alternate Mobile</span>
                        <span className="font-medium">{profileData.alternateMobile || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{profileData.email}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address Information */}
                  <Card className="shadow-md border border-border/50 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-saffron" />
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Address</span>
                        <span className="font-medium text-right max-w-[60%]">{profileData.address || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-muted-foreground">City</span>
                        <span className="font-medium">{profileData.city || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Pincode</span>
                        <span className="font-medium">{profileData.pincode || 'Not provided'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ProfilePage;
