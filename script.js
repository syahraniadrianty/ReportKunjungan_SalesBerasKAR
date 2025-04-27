// Inisialisasi Supabase
const supabaseUrl = 'https://lhrplbsaqejqsqnqzdjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxocnBsYnNhcWVqcXNxbnF6ZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTExMDYsImV4cCI6MjA2MDcyNzEwNn0.t02wRGv3WbVx9bKDoGgCNTfBIYftLOGFKxoJg6Jv1UI'; // Ganti dengan API Key Anda
const supabase = createClient(supabaseUrl, supabaseKey); // Inisialisasi client Supabase

// Tangkap lokasi
let currentLocationUrl = '';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formKunjungan');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  // Tangkap lokasi saat form dibuka
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      currentLocationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    }, (error) => {
      console.warn('Gagal mendapatkan lokasi:', error.message);
    });
  } else {
    alert('Geolocation tidak didukung oleh browser Anda.');
  }
});

// Fungsi upload foto
async function uploadFoto(file, namaFile) {
  const { data, error } = await supabase.storage
    .from('foto_toko')
    .upload(namaFile, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error('Upload foto gagal: ' + error.message);
  }

  // Ambil public URL dari file
  const { data: publicUrlData } = supabase
    .storage
    .from('foto_toko')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

// Fungsi handleSubmit untuk form
async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const fotoFile = formData.get('foto_toko');
  let urlFoto = '';

  try {
    if (fotoFile && fotoFile.name) {
      const namaFile = `foto_${Date.now()}_${fotoFile.name}`;
      urlFoto = await uploadFoto(fotoFile, namaFile);
    }

    // Pastikan lokasi tersedia sebelum mengirim data
    if (!currentLocationUrl) {
      alert('Lokasi toko tidak ditemukan.');
      return;
    }

    // Validasi input data
    const data = {
      nama_sales: formData.get('nama_sales'),
      tanggal_kunjungan: formData.get('tanggal_kunjungan'),
      kategori_toko: formData.get('kategori_toko'),
      nama_toko: formData.get('nama_toko'),
      status_toko: formData.get('status_toko'),
      provinsi: formData.get('provinsi'),
      kota_kabupaten: formData.get('kota_kabupaten'),
      kecamatan: formData.get('kecamatan'),
      kelurahan: formData.get('kelurahan'),
      nama_pic: formData.get('nama_pic'),
      no_pic: formData.get('no_pic'),
      kegiatan: formData.get('kegiatan'),
      deskripsi_kegiatan: formData.get('deskripsi_kegiatan'),
      kgberas_penjualanBerasToko: parseFloat(formData.get('kgberas_penjualanBerasToko')) || null,
      produk_pesaing: formData.get('produk_pesaing'),
      kg_produkpesaing: parseFloat(formData.get('kg_produkpesaing')) || null,
      harga_produkpesaing: parseFloat(formData.get('harga_produkpesaing')) || null,
      rincianPO_UnGlu5kg_pack: parseFloat(formData.get('rincianPO_UnGlu5kg_pack')) || null,
      rincianPO_Segowangi5kg_pack: parseFloat(formData.get('rincianPO_Segowangi5kg_pack')) || null,
      rincianPO_Segowangi2_5kg_pack: parseFloat(formData.get('rincianPO_Segowangi2_5kg_pack')) || null,
      rincianPO_CapSego10kg_pack: parseFloat(formData.get('rincianPO_CapSego10kg_pack')) || null,
      rincianPO_Medium25kg_pack: parseFloat(formData.get('rincianPO_Medium25kg_pack')) || null,
      rincianPO_Medium50kg_pack: parseFloat(formData.get('rincianPO_Medium50kg_pack')) || null,
      foto_toko: urlFoto,
      lokasi_toko: currentLocationUrl,
    };

    // Kirim data ke Supabase
    const { error } = await supabase
      .from('KunjunganSalesBerasKAR')
      .insert([data]);

    if (error) {
      alert('Gagal menyimpan data: ' + error.message);
      console.error('Supabase Error:', error);
    } else {
      alert('Data berhasil disimpan!');
      form.reset();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Terjadi kesalahan saat upload atau simpan data.');
  }
}
