import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-xl rounded-[2rem] border border-white/12 bg-white/6 p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.2)] backdrop-blur">
        <div className="text-xs tracking-[0.3em] text-[#f8c18b] uppercase">404</div>
        <h1 className="mt-4 text-4xl font-semibold text-white">这部电影暂时不在放映厅里</h1>
        <p className="mt-4 text-base leading-8 text-white/65">
          可能是链接有误，也可能这部影片已经不在当前上映列表中。你可以回到首页继续浏览正在上映的电影。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#f7b26a] px-5 py-3 text-sm font-semibold text-[#24150f] transition hover:brightness-105"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
