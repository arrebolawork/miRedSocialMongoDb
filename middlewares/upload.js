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
    folder: "profiles",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    public_id: (req, file) => `${Date.now()}-${file.originalname.split(".")[0]}`,
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
    console.log("Archivo:", file.originalname, file.mimetype);

    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes"), false);
    }
  },
});

// Crear instancia de upload
const uploadInstance = upload;

// Middleware personalizado para debugging
const uploadWithLogs = (fieldName) => {
  return (req, res, next) => {
    console.log("=== INICIANDO UPLOAD MIDDLEWARE ===");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Field name:", fieldName);

    uploadInstance.single(fieldName)(req, res, (err) => {
      console.log("=== RESULTADO UPLOAD MIDDLEWARE ===");

      if (err) {
        console.error("ERROR en upload:", err.message);
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "Archivo demasiado grande (máximo 5MB)" });
          }
        }
        return res.status(400).json({ message: `Error de upload: ${err.message}` });
      }

      console.log("Upload exitoso:");
      console.log(
        "req.file:",
        req.file
          ? {
              originalname: req.file.originalname,
              url: req.file.url,
              public_id: req.file.public_id,
              size: req.file.size,
            }
          : "No file uploaded"
      );
      console.log("req.body:", req.body);

      next();
    });
  };
};

// Exportar tanto la instancia como el middleware personalizado
module.exports = uploadInstance;
module.exports.withLogs = uploadWithLogs;
