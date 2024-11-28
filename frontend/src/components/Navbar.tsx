import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Brain, FileText, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/config/config";
import axios from "axios";
import { toast } from "sonner";

interface Page {
  _id: string;
  title: string;
}

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem("authToken");
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/pages/all`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      setPages(res.data.pages);
    } catch (error) {
      toast.error("Error while fetching pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchPages();
    }
  }, [isLoggedIn]);

  return (
    <header className="sticky top-0 z-50 w-full border-b text-black">
      <div className="px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Brain />
            <span className="hidden font-bold text-xl sm:inline-block">
              CoolPages
            </span>
          </Link>
          <nav className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Card className="bg-white/10 backdrop-blur-lg border-none">
                  <CardContent className="p-2">
                    <ScrollArea className="w-full whitespace-nowrap rounded-md">
                      <div className="flex w-max space-x-4 p-2">
                        {loading
                          ? Array(3)
                              .fill(0)
                              .map((_, i) => (
                                <Skeleton
                                  key={i}
                                  className="w-24 h-8 bg-white/20"
                                />
                              ))
                          : pages.map((page) => (
                              <Button
                                key={page._id}
                                size="sm"
                                onClick={() => navigate(`/page/${page._id}`)}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                {page.title}
                              </Button>
                            ))}
                      </div>
                      <ScrollBar
                        orientation="horizontal"
                        className="h-10 bg-sky-400"
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>
                {/* <Button
                  size="sm"
                  className=" text-white"
                  onClick={() => navigate("/create-page")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Page
                </Button> */}
                <Button size="sm" variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  className="text-white"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
