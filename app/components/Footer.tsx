export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#0a1628] border-t border-blue-900/50 py-6 text-center text-blue-300 text-sm">
      <p>&copy; {year} BlueOne Luxury Yacht Charters</p>
    </footer>
  );
}
