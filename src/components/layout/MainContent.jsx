export default function MainContent({ children }) {
  return (
    <main className="lg:me-80 md:ms-64 pt-14 md:pt-16 transition-all duration-300 min-h-screen bg-transparent">
      {children}
    </main>
  );
}
