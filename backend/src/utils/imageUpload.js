const supabase = require("../config/supabase");

const uploadImage = async (file) => {
  try {
    if (!file) return null;

    const fileName = `blog-images/${Date.now()}_${file.originalname}`;

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    const { data } = supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};

module.exports = uploadImage;
