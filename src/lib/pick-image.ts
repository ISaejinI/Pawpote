import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export type ImageSource = 'library' | 'camera';

/**
 * Ouvre la photothèque ou l'appareil photo et renvoie l'URI locale de la photo, ou `null` si annulé.
 * `aspect` n'est appliqué au recadrage que sur Android (iOS recadre toujours en carré).
 */
export async function pickImage({
  source = 'library',
  aspect,
}: {
  source?: ImageSource;
  aspect: [number, number];
}) {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.8,
  };

  try {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Accès à l’appareil photo refusé',
          'Autorise PawPote à utiliser l’appareil photo dans les réglages de ton téléphone.',
        );
        return null;
      }
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    return result.canceled ? null : (result.assets[0]?.uri ?? null);
  } catch (error) {
    console.error('Image picker error:', error);
    return null;
  }
}
