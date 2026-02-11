import {
  CameraIcon,
  CodeIcon,
  ComputerCodeIcon,
  CubeIcon,
  GamePadIcon,
  MathIcon,
  MobileCodeIcon,
  PaletteIcon,
  PhotoAndVideoIcon,
  RobotIcon,
  SpeakerIcon
} from '@icons'
import type { Category } from '@types'

interface CategoryValues {
  icon: React.ReactNode
  image: string
}

// Mapping of categories to their corresponding icons and images
const categoriesMap: Record<Category, CategoryValues> = {
  '2D Animation': { icon: <PaletteIcon />, image: '2d-design' },
  'Graphic Design': { icon: <PaletteIcon />, image: '2d-design' },
  'Logo & Branding Design': { icon: <PaletteIcon />, image: '2d-design' },
  'UI/UX Design': { icon: <PaletteIcon />, image: '2d-design' },
  '3D Animation': { icon: <CubeIcon />, image: '3d-design' },
  '3D Modeling': { icon: <CubeIcon />, image: '3d-design' },
  'Backend Development': { icon: <CodeIcon />, image: 'programming' },
  'Data Science': { icon: <CodeIcon />, image: 'programming' },
  Databases: { icon: <CodeIcon />, image: 'programming' },
  Programming: { icon: <CodeIcon />, image: 'programming' },
  'Web Development': { icon: <ComputerCodeIcon />, image: 'desktop-development' },
  'Software Development': { icon: <ComputerCodeIcon />, image: 'desktop-development' },
  'Mobile App Development': { icon: <MobileCodeIcon />, image: 'mobile-development' },
  'Game Development': { icon: <GamePadIcon />, image: 'game-development' },
  'Music Theory': { icon: <SpeakerIcon />, image: 'music-production' },
  'Audio Mixing & Mastering': { icon: <SpeakerIcon />, image: 'music-production' },
  'Sound Design': { icon: <SpeakerIcon />, image: 'music-production' },
  'Machine Learning': { icon: <RobotIcon />, image: 'machine-learning' },
  'Prompt Engineering': { icon: <RobotIcon />, image: 'machine-learning' },
  Robotics: { icon: <RobotIcon />, image: 'machine-learning' },
  'Video Editing': { icon: <PhotoAndVideoIcon />, image: 'video-editing' },
  'Visual Effects': { icon: <PhotoAndVideoIcon />, image: 'video-editing' },
  Cinematography: { icon: <PhotoAndVideoIcon />, image: 'video-editing' },
  Mathematics: { icon: <MathIcon />, image: 'mathematics' },
  Physics: { icon: <MathIcon />, image: 'mathematics' },
  Geometry: { icon: <MathIcon />, image: 'mathematics' },
  Statistics: { icon: <MathIcon />, image: 'mathematics' },
  Photography: { icon: <CameraIcon />, image: 'photography' },
  Productivity: { icon: <CameraIcon />, image: 'photography' },
  'Study Techniques': { icon: <CameraIcon />, image: 'photography' }
}

// Fallback values in case a category is not found in the categoryValues array
const defaultValues = {
  icon: <CodeIcon />,
  image: 'programming'
}

/**
 * Retrieves the icon component and image name values for a given category.
 * @param category - The category for which to retrieve the corresponding icon and image values
 * @returns An object containing the icon and image values for the specified category, or default values if the category is not found
 */
export const getCategoryValues = (category: Category) => {
  const values = categoriesMap[category]
  return values ?? defaultValues
}
