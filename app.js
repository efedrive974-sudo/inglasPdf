// 1. FİREBASE YAPILANDIRMASI
const firebaseConfig = {
  apiKey: "AIzaSyDzOO7U31_DpH3xNQpalBxR3pvkTmDF5lU",
  authDomain: "pdfcorse-b7794.firebaseapp.com",
  projectId: "pdfcorse-b7794",
  storageBucket: "pdfcorse-b7794.firebasestorage.app", // .app olarak güncelledik
  messagingSenderId: "839922447359",
  appId: "1:839922447359:web:28a3ad1a93ecd6047bedca",
  measurementId: "G-VHFDF7SLSX"
};

// Firebase'i Başlat (CDN/Compat Modu)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const storage = firebase.storage();

// --- 2. OTURUM VE SAYFA KORUMA ---
auth.onAuthStateChanged((user) => {
    const path = window.location.pathname;
    
    if (user) {
        // Kullanıcı giriş yapmış, konsoldaysa ismini yazdır
        if (document.getElementById('user-name')) {
            document.getElementById('user-name').innerText = `Hoş geldin, ${user.displayName}`;
        }
        // index.html'deyse console'a yönlendir
        if (path.includes("index.html") || path === "/") {
            window.location.href = "console.html";
        }
    } else {
        // Giriş yapmamışsa ve console'daysa index'e at
        if (path.includes("console.html")) {
            window.location.href = "index.html";
        }
    }
});

// --- 3. GİRİŞ VE ÇIKIŞ ---
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch((error) => {
        alert("Giriş hatası: " + error.message);
    });
}

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}

// --- 4. DOSYA YÜKLEME ---
const fileInput = document.getElementById('file-input');
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            uploadFile(file);
        } else {
            alert("Lütfen sadece PDF dosyası seçin.");
        }
    });
}

function uploadFile(file) {
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status-text');
    const uploadStatus = document.getElementById('upload-status');
    const resultArea = document.getElementById('result-area');
    const shareLink = document.getElementById('share-link');

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
        (error) => { alert("Hata: " + error.message); }, 
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((url) => {
                uploadStatus.classList.add('hidden');
                resultArea.classList.remove('hidden');
                shareLink.value = url;
            });
        }
    );
}

// Kopyalama Fonksiyonu
function copyLink() {
    const linkInput = document.getElementById('share-link');
    linkInput.select();
    navigator.clipboard.writeText(linkInput.value);
    alert("Link kopyalandı!");
}
