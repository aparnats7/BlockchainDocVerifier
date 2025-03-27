import React from 'react';
import PageHeader from '@/components/layout/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const notificationsFormSchema = z.object({
  verificationComplete: z.boolean().default(true),
  verificationFailed: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

const Settings: React.FC = () => {
  const { toast } = useToast();
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
    },
  });
  
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      verificationComplete: true,
      verificationFailed: true,
      securityAlerts: true,
      marketingEmails: false,
    },
  });
  
  function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
    console.log(data);
  }
  
  function onNotificationsSubmit(data: z.infer<typeof notificationsFormSchema>) {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
    console.log(data);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader 
        title="Account Settings" 
        description="Manage your account preferences and settings"
      />
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormDescription>
                          We'll use this email for notifications and security alerts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                  <FormField
                    control={notificationsForm.control}
                    name="verificationComplete"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Verification Complete
                          </FormLabel>
                          <FormDescription>
                            Receive notifications when document verification is complete.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="verificationFailed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Verification Failed
                          </FormLabel>
                          <FormDescription>
                            Receive notifications when document verification fails.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="securityAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Security Alerts
                          </FormLabel>
                          <FormDescription>
                            Receive notifications about security-related events.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="marketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Marketing Emails
                          </FormLabel>
                          <FormDescription>
                            Receive marketing and promotional emails.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Preferences</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Change Password</h3>
                <p className="text-sm text-gray-500 mb-4">Update your password to keep your account secure.</p>
                <form className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="current-password" className="text-sm font-medium text-gray-700">Current Password</label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="new-password" className="text-sm font-medium text-gray-700">New Password</label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </form>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account.</p>
                <Button variant="outline">Enable Two-Factor Authentication</Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Active Sessions</h3>
                <p className="text-sm text-gray-500 mb-4">Manage your active sessions and sign out from other devices.</p>
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">Current Session</p>
                        <p className="text-sm text-gray-500">Last active: Just now</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">Sign Out All Other Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blockchain">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Blockchain Configuration</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Blockchain Connection</h3>
                <p className="text-sm text-gray-500 mb-4">Configure your blockchain connection preferences.</p>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium text-gray-900">Network Status</p>
                      <p className="text-sm text-gray-500">Connected to IPFS network</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium text-gray-900">Encryption Level</p>
                      <p className="text-sm text-gray-500">256-bit AES encryption</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Document Storage</h3>
                <p className="text-sm text-gray-500 mb-4">Manage your blockchain document storage settings.</p>
                <form className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="storage-node" className="text-sm font-medium text-gray-700">IPFS Node</label>
                    <Input id="storage-node" defaultValue="ipfs.infura.io" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="redundancy" className="text-sm font-medium text-gray-700">Redundancy</label>
                      <Input id="redundancy" type="number" defaultValue="3" min="1" max="10" />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="encryption" className="text-sm font-medium text-gray-700">Encryption Type</label>
                      <select id="encryption" className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <option>AES-256</option>
                        <option>RSA-2048</option>
                        <option>ED25519</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button>Save Settings</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Settings;
