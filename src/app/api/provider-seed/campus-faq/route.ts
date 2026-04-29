import { NextResponse } from "next/server";

const faq = [
  {
    keywords: ["sidang", "ta", "skripsi", "thesis"],
    answer:
      "Untuk sidang TA, biasanya mahasiswa perlu menyelesaikan naskah, mendapat persetujuan pembimbing, memenuhi administrasi prodi, dan mengunggah berkas sesuai jadwal."
  },
  {
    keywords: ["krs", "kuliah", "semester"],
    answer:
      "KRS umumnya dilakukan melalui sistem akademik pada periode registrasi. Pastikan tidak ada tagihan atau prasyarat mata kuliah yang belum terpenuhi."
  }
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.question ?? body.input?.question ?? "").toLowerCase();
  const match = faq.find((item) => item.keywords.some((keyword) => question.includes(keyword)));

  return NextResponse.json({
    answer:
      match?.answer ??
      "Aku belum menemukan jawaban spesifik di seed FAQ. Coba tanyakan tentang sidang TA, KRS, atau proses perkuliahan.",
    confidence: match ? 0.84 : 0.42,
    source: "Seed FAQ dataset"
  });
}
