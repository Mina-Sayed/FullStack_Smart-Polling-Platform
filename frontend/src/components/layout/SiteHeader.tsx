import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

const SiteHeader = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    firstName: '', 
    lastName: '' 
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData);
      setIsAuthOpen(false);
      setLoginData({ email: '', password: '' });
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerData);
      setIsAuthOpen(false);
      setRegisterData({ email: '', password: '', firstName: '', lastName: '' });
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 font-bold tracking-tight">
          <span className="logo-text bg-clip-text text-transparent gradient-text">Flow Poll Forge</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-3">
          <NavLink to="/create" className={({ isActive }) =>
            `text-sm font-medium transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/70'}`
          }>
            Create
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.firstName}!
              </span>
              <Button asChild>
                <Link to="/create">New Poll</Link>
              </Button>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link to="/create">New Poll</Link>
              </Button>
              
              <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Login</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Welcome to Flow Poll Forge</DialogTitle>
                    <DialogDescription>
                      Sign in to your account or create a new one to get started.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                      <Card>
                        <CardContent className="space-y-4 pt-6">
                          <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="login-email">Email</Label>
                              <Input
                                id="login-email"
                                type="email"
                                value={loginData.email}
                                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="login-password">Password</Label>
                              <Input
                                id="login-password"
                                type="password"
                                value={loginData.password}
                                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              Login
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="register">
                      <Card>
                        <CardContent className="space-y-4 pt-6">
                          <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="register-firstname">First Name</Label>
                                <Input
                                  id="register-firstname"
                                  value={registerData.firstName}
                                  onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="register-lastname">Last Name</Label>
                                <Input
                                  id="register-lastname"
                                  value={registerData.lastName}
                                  onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="register-email">Email</Label>
                              <Input
                                id="register-email"
                                type="email"
                                value={registerData.email}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="register-password">Password</Label>
                              <Input
                                id="register-password"
                                type="password"
                                value={registerData.password}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                                minLength={6}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              Register
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
