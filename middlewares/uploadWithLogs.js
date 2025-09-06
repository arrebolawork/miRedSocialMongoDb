const upload = require("./upload");

const uploadWithLogs = (req, res, next) => {
  console.log("=== INICIANDO UPLOAD CON LOGS ===");
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Content-Length:", req.headers["content-length"]);

  upload.single("image")(req, res, (err) => {
    console.log("=== RESULTADO UPLOAD ===");

    if (err) {
      console.error("ERROR en upload:", {
        name: err.name,
        message: err.message,
        code: err.code,
      });

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Archivo demasiado grande (máximo 5MB)" });
      }
      return res.status(400).json({ message: `Error de upload: ${err.message}` });
    }

    console.log("Upload completado:");
    if (req.file) {
      console.log("Archivo subido:", {
        originalname: req.file.originalname,
        url: req.file.url,
        public_id: req.file.public_id,
        size: req.file.size,
      });
    } else {
      console.log("No se subió archivo");
    }

    console.log("req.body:", req.body);

    next();
  });
};

module.exports = uploadWithLogs;
