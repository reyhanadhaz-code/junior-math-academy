import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "id" | "en";

export const translations = {
  id: {
    appName: "MathKids",
    tagline: "Belajar Matematika Seru!",
    nav: { home: "Beranda", cartesian: "Kartesius", shapes: "Bangun Datar", history: "Riwayat" },
    welcome: "Halo, Pelajar Hebat! Yuk belajar matematika bersama! 🌟",
    home: {
      title: "Pilih Petualangan Belajarmu",
      subtitle: "Klik salah satu kartu untuk mulai belajar!",
    },
    cards: {
      cartesian: { title: "Diagram Kartesius", desc: "Plot dan simpan titik koordinat" },
      shapes: { title: "Bangun Datar", desc: "Hitung sisi, keliling, luas & transformasi" },
      transform: { title: "Transformasi", desc: "Translasi, refleksi, rotasi, dilatasi" },
      history: { title: "Riwayat", desc: "Lihat semua catatan perhitungan" },
      favorites: { title: "Favorit", desc: "Perhitungan favorit kamu" },
      help: { title: "Bantuan", desc: "Cara menggunakan aplikasi" },
    },
    common: {
      save: "Simpan", cancel: "Batal", edit: "Edit", delete: "Hapus", reset: "Atur Ulang",
      add: "Tambah", update: "Perbarui", confirm: "Ya, Lanjutkan", yes: "Ya", no: "Tidak",
      name: "Nama", color: "Warna", actions: "Aksi", empty: "Belum ada data 🌱",
      back: "Kembali", download: "Unduh PNG", formula: "Rumus",
      result: "Hasil", calculate: "Hitung", saved: "Data berhasil disimpan! ✅",
      deleted: "Data berhasil dihapus! 🗑️", updated: "Data berhasil diperbarui! ✨",
      confirmDelete: "Yakin ingin menghapus data ini?",
      confirmClear: "Yakin ingin menghapus semua riwayat?",
      type: "Jenis", date: "Tanggal", summary: "Ringkasan",
      filterAll: "Semua", clearAll: "Hapus Semua",
      addFav: "Tambah Favorit", removeFav: "Hapus Favorit",
      noFav: "Belum ada favorit. Tandai ⭐ pada riwayat!",
    },
    cartesian: {
      title: "Diagram Kartesius",
      info: "Diagram Kartesius adalah sistem koordinat dengan sumbu X (mendatar) dan sumbu Y (tegak) untuk menentukan posisi titik di bidang datar.",
      pointName: "Nama Titik (A, B, C...)", x: "Koordinat X", y: "Koordinat Y",
      connect: "Hubungkan Titik", resetAll: "Hapus Semua Titik",
      errName: "⚠️ Nama titik wajib diisi!", errNum: "⚠️ X dan Y harus berupa angka!",
    },
    shapes: {
      title: "Bangun Datar",
      select: "Pilih Bangun",
      perimeter: "Keliling", area: "Luas", sides: "Panjang Sisi",
      tabCalc: "Kalkulator", tabTrans: "Transformasi",
      list: { square: "Persegi", rectangle: "Persegi Panjang", triangle: "Segitiga", circle: "Lingkaran", trapezoid: "Trapesium", parallelogram: "Jajar Genjang" },
      labels: { side: "Sisi (s)", length: "Panjang (p)", width: "Lebar (l)", base: "Alas (a)", height: "Tinggi (t)", radius: "Jari-jari (r)", topSide: "Sisi Atas", bottomSide: "Sisi Bawah", legSide: "Sisi Miring" },
    },
    trans: {
      title: "Transformasi Bangun",
      vertices: "Titik-titik Sudut", addVertex: "+ Tambah Titik",
      type: { translation: "Translasi", reflection: "Refleksi", rotation: "Rotasi", dilation: "Dilatasi" },
      shiftX: "Geser X (a)", shiftY: "Geser Y (b)",
      axis: "Sumbu", angle: "Sudut", direction: "Arah", cw: "Searah Jarum", ccw: "Berlawanan",
      scale: "Skala (k)", centerX: "Pusat X", centerY: "Pusat Y",
      before: "Sebelum (biru)", after: "Sesudah (oranye)",
      steps: "Langkah Perhitungan",
    },
    history: { title: "Riwayat", filterAll: "Semua", filterCart: "Kartesius", filterShape: "Bangun", filterTrans: "Transformasi" },
    favorites: { title: "Favorit" },
    help: {
      title: "Bantuan",
      items: [
        { q: "Bagaimana cara menambah titik?", a: "Buka menu Kartesius, isi nama, X, Y, lalu klik Simpan." },
        { q: "Bagaimana menyimpan ke favorit?", a: "Buka Riwayat, klik ikon ⭐ pada item yang kamu sukai." },
        { q: "Apakah data hilang jika tutup browser?", a: "Tidak! Data disimpan di localStorage perangkatmu." },
      ],
    },
  },
  en: {
    appName: "MathKids",
    tagline: "Fun Math Learning!",
    nav: { home: "Home", cartesian: "Cartesian", shapes: "Shapes", history: "History" },
    welcome: "Hello, Super Student! Let's learn math together! 🌟",
    home: {
      title: "Pick Your Learning Adventure",
      subtitle: "Tap a card to start learning!",
    },
    cards: {
      cartesian: { title: "Cartesian Diagram", desc: "Plot and save coordinate points" },
      shapes: { title: "Flat Shapes", desc: "Calculate sides, perimeter, area & transformations" },
      transform: { title: "Transformation", desc: "Translate, reflect, rotate, and dilate shapes" },
      history: { title: "History", desc: "View all saved calculation records" },
      favorites: { title: "Favorites", desc: "Your saved favorite calculations" },
      help: { title: "Help", desc: "How to use this app" },
    },
    common: {
      save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete", reset: "Reset",
      add: "Add", update: "Update", confirm: "Yes, Continue", yes: "Yes", no: "No",
      name: "Name", color: "Color", actions: "Actions", empty: "No data yet 🌱",
      back: "Back", download: "Download PNG", formula: "Formula",
      result: "Result", calculate: "Calculate", saved: "Data saved successfully! ✅",
      deleted: "Data deleted successfully! 🗑️", updated: "Data updated successfully! ✨",
      confirmDelete: "Are you sure you want to delete this?",
      confirmClear: "Are you sure you want to clear all history?",
      type: "Type", date: "Date", summary: "Summary",
      filterAll: "All", clearAll: "Clear All",
      addFav: "Add to Favorites", removeFav: "Remove from Favorites",
      noFav: "No favorites yet. Tap ⭐ on history items!",
    },
    cartesian: {
      title: "Cartesian Diagram",
      info: "A Cartesian diagram is a coordinate system using the X-axis (horizontal) and Y-axis (vertical) to plot point positions on a plane.",
      pointName: "Point Name (A, B, C...)", x: "X Coordinate", y: "Y Coordinate",
      connect: "Connect Points", resetAll: "Reset All Points",
      errName: "⚠️ Point name is required!", errNum: "⚠️ X and Y must be numbers!",
    },
    shapes: {
      title: "Flat Shapes",
      select: "Select Shape",
      perimeter: "Perimeter", area: "Area", sides: "Side Lengths",
      tabCalc: "Calculator", tabTrans: "Transformation",
      list: { square: "Square", rectangle: "Rectangle", triangle: "Triangle", circle: "Circle", trapezoid: "Trapezoid", parallelogram: "Parallelogram" },
      labels: { side: "Side (s)", length: "Length (l)", width: "Width (w)", base: "Base (b)", height: "Height (h)", radius: "Radius (r)", topSide: "Top Side", bottomSide: "Bottom Side", legSide: "Leg" },
    },
    trans: {
      title: "Shape Transformation",
      vertices: "Vertices", addVertex: "+ Add Vertex",
      type: { translation: "Translation", reflection: "Reflection", rotation: "Rotation", dilation: "Dilation" },
      shiftX: "Shift X (a)", shiftY: "Shift Y (b)",
      axis: "Axis", angle: "Angle", direction: "Direction", cw: "Clockwise", ccw: "Counter-clockwise",
      scale: "Scale (k)", centerX: "Center X", centerY: "Center Y",
      before: "Before (blue)", after: "After (orange)",
      steps: "Calculation Steps",
    },
    history: { title: "History", filterAll: "All", filterCart: "Cartesian", filterShape: "Shapes", filterTrans: "Transformation" },
    favorites: { title: "Favorites" },
    help: {
      title: "Help",
      items: [
        { q: "How do I add a point?", a: "Open Cartesian menu, fill in name, X, Y, then click Save." },
        { q: "How do I save to favorites?", a: "Open History, tap the ⭐ icon on the item you like." },
        { q: "Is my data lost if I close the browser?", a: "No! Data is saved in your device's localStorage." },
      ],
    },
  },
};

export type Dict = typeof translations.id;
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("mk_lang") as Lang | null;
    if (stored === "id" || stored === "en") setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("mk_lang", l);
  };
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
