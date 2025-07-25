import Link from "next/link";

export default function Home() {
  
  return (
    <div>
      <h1>Home</h1>

      <ul>
        <li>
          <Link href="/menu">Go Menu</Link>
        </li>
      </ul>
    </div>
  );
}
