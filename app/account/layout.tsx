const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex justify-end w-full bg-slate-300 text-slate-900 dark:text-slate-100 dark:bg-slate-800">
      {children}
    </section>
  );
};

export default AccountLayout;
