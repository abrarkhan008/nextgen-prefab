// import { Capacitor } from "@capacitor/core";
// import { Filesystem, Directory } from "@capacitor/filesystem";
// import { Share } from "@capacitor/share";

// function isAndroidApp() {
//   return Capacitor.isNativePlatform();
// }

// function blobToBase64(blob) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();

//     reader.onloadend = () => {
//       const result = reader.result;

//       if (typeof result !== "string") {
//         reject(new Error("Could not convert PDF to base64"));
//         return;
//       }

//       resolve(result.split(",")[1]);
//     };

//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// }

// export async function downloadPdf(pdf, filename) {
//   try {
//     const blob = pdf.output("blob");

//     // ANDROID
//     if (isAndroidApp()) {
//       const base64 = await blobToBase64(blob);

//       const result = await Filesystem.writeFile({
//         path: filename,
//         data: base64,
//         directory: Directory.Cache,
//       });

//       await Share.share({
//         title: filename,
//         text: "PDF document",
//         url: result.uri,
//         dialogTitle: "Save PDF",
//       });

//       return {
//         method: "android",
//         uri: result.uri,
//       };
//     }

//     // BROWSER
//     pdf.save(filename);

//     return {
//       method: "browser",
//     };
//   } catch (error) {
//     console.error("PDF save failed:", error);
//     alert("PDF could not be saved.");
//     throw error;
//   }
// }

// export async function sharePdf(pdf, filename) {
//   try {
//     const blob = pdf.output("blob");

//     // ANDROID
//     if (isAndroidApp()) {
//       const base64 = await blobToBase64(blob);

//       const result = await Filesystem.writeFile({
//         path: filename,
//         data: base64,
//         directory: Directory.Cache,
//       });

//       await Share.share({
//         title: filename,
//         text: "PDF document",
//         url: result.uri,
//         dialogTitle: "Share PDF",
//       });

//       return {
//         method: "android-share",
//         uri: result.uri,
//       };
//     }

//     // BROWSER
//     const file = new File([blob], filename, {
//       type: "application/pdf",
//     });

//     if (
//       navigator.share &&
//       navigator.canShare &&
//       navigator.canShare({ files: [file] })
//     ) {
//       await navigator.share({
//         title: filename,
//         files: [file],
//       });

//       return {
//         method: "web-share",
//       };
//     }

//     pdf.save(filename);

//     return {
//       method: "browser-download",
//     };
//   } catch (error) {
//     console.error("PDF share failed:", error);
//     alert("PDF could not be shared.");
//     throw error;
//   }
// }
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

function isAndroidApp() {
  return Capacitor.isNativePlatform();
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not convert PDF to base64"));
        return;
      }
      resolve(result.split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Writes a large base64 string to disk in small pieces instead of one
// giant bridge call, avoiding the OutOfMemoryError.
async function writeBase64Chunked(base64, filename) {
  const CHUNK_SIZE = 400_000; // ~400KB of base64 text per call
  const totalChunks = Math.ceil(base64.length / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const chunk = base64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

    if (i === 0) {
      await Filesystem.writeFile({
        path: filename,
        data: chunk,
        directory: Directory.Cache,
      });
    } else {
      await Filesystem.appendFile({
        path: filename,
        data: chunk,
        directory: Directory.Cache,
      });
    }
  }

  const { uri } = await Filesystem.getUri({
    path: filename,
    directory: Directory.Cache,
  });

  return uri;
}

export async function downloadPdf(pdf, filename) {
  try {
    const blob = pdf.output("blob");

    if (isAndroidApp()) {
      const base64 = await blobToBase64(blob);
      const uri = await writeBase64Chunked(base64, filename);

      await Share.share({
        title: filename,

        url: uri,
        dialogTitle: "Save PDF",
      });

      return { method: "android", uri };
    }

    pdf.save(filename);
    return { method: "browser" };
  } catch (error) {
    console.error("PDF save failed:", error);
    alert("PDF could not be saved.");
    throw error;
  }
}

export async function sharePdf(pdf, filename) {
  try {
    const blob = pdf.output("blob");

    if (isAndroidApp()) {
      const base64 = await blobToBase64(blob);
      const uri = await writeBase64Chunked(base64, filename);

      await Share.share({
        title: filename,

        url: uri,
        dialogTitle: "Share PDF",
      });

      return { method: "android-share", uri };
    }

    const file = new File([blob], filename, { type: "application/pdf" });

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({ title: filename, files: [file] });
      return { method: "web-share" };
    }

    pdf.save(filename);
    return { method: "browser-download" };
  } catch (error) {
    console.error("PDF share failed:", error);
    alert("PDF could not be shared.");
    throw error;
  }
}
