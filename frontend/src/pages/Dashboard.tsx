import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Page Details</CardTitle>
            </CardHeader>
            <CardContent>
              <span>Select a page for details</span>
            </CardContent>
          </Card>
        }
      </main>
    </div>
  );
};

export default Dashboard;
