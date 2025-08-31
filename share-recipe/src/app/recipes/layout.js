

export default async function Layout({ children }) {
  
  return (
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col">
          <main>{children}</main>
        </div>
      </div>
  );
}
