// 1. FİREBASE YAPILANDIRMASI
const firebaseConfig = {
  apiKey: "AIzaSyDzOO7U31_DpH3xNQpalBxR3pvkTmDF5lU",
  authDomain: "pdfcorse-b7794.firebaseapp.com",
  projectId: "pdfcorse-b7794",
  storageBucket: "pdfcorse-b7794.firebasestorage.app",
  messagingSenderId: "839922447359",
  appId: "1:839922447359:web:28a3ad1a93ecd6047bedca",
  measurementId: "G-VHFDF7SLSX"
};

// Firebase'i Başlat
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const storage = firebase.storage();

// --- 2. OTURUM VE SAYFA KORUMA SİSTEMİ ---
// Bu bölüm sayfa her açıldığında çalışır
auth.onAuthStateChanged((user) => {
    const path = window.location.pathname;
    const isConsole = path.includes("console.html");
    const isIndex = path.includes("index.html") || path === "/";

    if (user) {
        console.log("Kullanıcı aktif:", user.displayName);
        // Eğer kullanıcı varsa ve console sayfasındaysa ismini yazdır
        const userDisplay = document.getElementById('user-name');
        if (userDisplay) {
            userDisplay.innerText = `Hoş geldin, ${user.displayName}`;
        }
        // Giriş yapmışsa ve anasayfadaysa konsola gönder
        if (isIndex) {
            window.location.href = "console.html";
        }
    } else {
        // Kullanıcı yoksa ve konsola girmeye çalışıyorsa girişe at
        if (isConsole) {
            window.location.href = "index.html";
        }
    }
});

// --- 3. GİRİŞ VE ÇIKIŞ FONKSİYONLARI ---
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log("Giriş Başarılı!");
            // Giriş anında yönlendirmeyi tetikle
            window.location.href = "console.html";
        })
        .catch((error) => {
            console.error("Giriş Hatası:", error.code);
            alert("Giriş yapılamadı: " + error.message);
        });
}

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}

// --- 4. DOSYA YÜKLEME MANTIĞI ---
const fileInput = document.getElementById('file-input');
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                alert("Lütfen sadece PDF dosyası yükleyin!");
                return;
            }
            uploadFile(file);
        }
    });
}

function uploadFile(file) {
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status-text');
    const uploadStatus = document.getElementById('upload-status');
    const resultArea = document.getElementById('result-area');
    const shareLink = document.getElementById('share-link');

    // UI hazırlığı
    uploadStatus.classList.remove('hidden');
    resultArea.classList.add('hidden');

    const fileName = Date.now() + "_" + file.name;
    const storageRef = storage.ref('pdfs/' + fileName);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = progress + '%';
            statusText.innerText = `Yükleniyor... %${Math.round(progress)}`;
        }, 
        (error) => {
            console.error("Yükleme hatası:", error);
            alert("Dosya yüklenemedi. Storage kurallarını kontrol edin.");
        }, 
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                uploadStatus.classList.add('hidden');
                resultArea.classList.remove('hidden');
                shareLink.value = downloadURL;
            });
        }
    );
}

// --- 5. YARDIMCI FONKSİYONLAR ---
function copyLink() {
    const copyText = document.getElementById("share-link");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("Link kopyalandı! Arkadaşlarına gönderebilirsin.");
}
