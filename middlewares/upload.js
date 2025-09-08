const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

console.log("=== CONFIGURANDO CLOUDINARY ===");

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verificar configuración
console.log("Cloudinary configurado:", {
  cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
  api_key: !!process.env.CLOUDINARY_API_KEY,
  api_secret: !!process.env.CLOUDINARY_API_SECRET,
});

// Storage de Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    public_id: (req, file) => {
      const baseName = file.originalname
        .split(".")[0]
        .replace(/\s+/g, "_") // quita espacios
        .replace(/[^a-zA-Z0-9_-]/g, ""); // limpia caracteres raros
      return `${Date.now()}-${baseName}`;
    },
  },
});

// Configuración de multer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log("=== MULTER FILE FILTER ===");
    console.log("Archivo recibido:", file.originalname, "-", file.mimetype);

    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes"), false);
    }
  },
});

module.exports = upload;
