type PageContainerProps = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {children}
    </div>
  );
}