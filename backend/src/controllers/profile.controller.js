import { findUserById, updateUser } from '../models/index.js';

export async function getProfile(req, res, next) {
  try {
    const result = await findUserById(req.user.userId);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });
    }
    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profile_image,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email, profileImage } = req.body;

    if (profileImage && typeof profileImage === 'string' && profileImage.startsWith('data:')) {
      const sizeInMB = Buffer.byteLength(profileImage, 'utf-8') / (1024 * 1024);
      if (sizeInMB > 1) {
        return res.status(400).json({
          success: false,
          message: 'Profile image exceeds 1MB limit. Please use a smaller image or a URL instead.',
          code: 'IMAGE_TOO_LARGE'
        });
      }
    }

    const result = await updateUser(req.user.userId, { name, email, profileImage });
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });
    }
    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profile_image,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}
