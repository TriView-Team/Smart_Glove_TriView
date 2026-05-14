const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex justify-center bg-background">
      <div className="w-full max-w-[430px] md:max-w-[768px] lg:max-w-[1024px] min-h-screen relative">
        {children}
      </div>
    </div>
  );
};

export default AppShell;
