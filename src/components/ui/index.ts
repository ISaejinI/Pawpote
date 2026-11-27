/**
 * Design system de Pawpote, rangé par thème d'interface.
 * Composants de présentation uniquement : ni appel à l'API ni logique métier (voir eslint.config.js).
 */

// Éléments de base : boutons, icônes, étiquettes
export {
  ActionTile,
  type ActionTileColor,
  type ActionTileProps,
} from './base/action-tile';
export { Badge, type BadgeProps, type BadgeVariant } from './base/badge';
export {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './base/button';
export { Chip, type ChipColor, type ChipProps } from './base/chip';
export { Icon, type IconProps } from './base/icon';
export {
  IconButton,
  type IconButtonProps,
  type IconButtonSize,
  type IconButtonVariant,
} from './base/icon-button';
export { IconTile, type IconTileColor, type IconTileProps } from './base/icon-tile';
export { icons, type IconName } from './base/icons';
export { Logo, type LogoProps } from './base/logo';
export {
  Sticker,
  type StickerProps,
  type StickerSize,
  type StickerVariant,
} from './base/sticker';
export { Tag, type TagColor, type TagProps } from './base/tag';
export { TextLink, type TextLinkProps } from './base/text-link';

// États et progression
export { Callout, type CalloutProps } from './feedback/callout';
export { LoadStatus, type LoadStatusProps } from './feedback/load-status';
export { PageDots, type PageDotsProps } from './feedback/page-dots';
export { PawLoader, type PawLoaderProps } from './feedback/paw-loader';
export { ProgressBar, type ProgressBarProps } from './feedback/progress-bar';

// Formulaires
export { AvatarField, type AvatarFieldProps } from './forms/avatar-field';
export {
  ChoiceGroup,
  type ChoiceGroupProps,
  type ChoiceOption,
} from './forms/choice-group';
export { DateInput, type DateInputProps } from './forms/date-input';
export { FormField, useFormField, type FormFieldProps } from './forms/form-field';
export { FormSection, type FormSectionProps } from './forms/form-section';
export { Input, type InputProps } from './forms/input';
export { PasswordInput, type PasswordInputProps } from './forms/password-input';
export { SearchField, type SearchFieldProps } from './forms/search-field';
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedOption,
} from './forms/segmented-control';
export { Select, type SelectProps } from './forms/select';
export { TextArea, type TextAreaProps } from './forms/text-area';

// Photos et avatars
export { Avatar, type AvatarProps } from './media/avatar';
export {
  DogPhotosEditor,
  type DogPhotosEditorProps,
  type DogPhotoTarget,
} from './media/dog-photos-editor';
export { DuoAvatar, type DuoAvatarProps } from './media/duo-avatar';
export { PhotoCarousel, type PhotoCarouselProps } from './media/photo-carousel';
export { PhotoSlot, type PhotoSlotProps, type PhotoSlotVariant } from './media/photo-slot';
export {
  PhotoSourceSheet,
  type PhotoSourceSheetProps,
} from './media/photo-source-sheet';
export { ProfileAvatars, type ProfileAvatarsProps } from './media/profile-avatars';

// Mise en page et navigation
export { BottomSheet, type BottomSheetProps } from './layout/bottom-sheet';
export { EditHeader, type EditHeaderProps } from './layout/edit-header';
export { EditPage, type EditPageProps, type EditPageScrollRef } from './layout/edit-page';
export { LoadingPage, type LoadingPageProps } from './layout/loading-page';
export { PullToClose, type PullToCloseProps } from './layout/pull-to-close';
export { TabPage, type TabPageProps } from './layout/tab-page';
export {
  Tapbar,
  TapbarTab,
  useTapbarInset,
  type TapbarTabProps,
} from './layout/tapbar';
export { WaveBackground } from './layout/wave-background';

// Messagerie
export { ChatBackground } from './messaging/chat-background';
export {
  ConversationHeader,
  type ConversationHeaderProps,
} from './messaging/conversation-header';
export { ConversationList, type ConversationListProps } from './messaging/conversation-list';
export { ConversationPage, type ConversationPageProps } from './messaging/conversation-page';
export { ConversationRow, type ConversationRowProps } from './messaging/conversation-row';
export { MatchBanner, type MatchBannerProps } from './messaging/match-banner';
export { MessageBubble, type MessageBubbleProps } from './messaging/message-bubble';
export { MessageComposer, type MessageComposerProps } from './messaging/message-composer';
export { NewMatchItem, type NewMatchItemProps } from './messaging/new-match-item';
export { NewMatchesStrip, type NewMatchesStripProps } from './messaging/new-matches-strip';
export { WalkProposalCard, type WalkProposalCardProps } from './messaging/walk-proposal-card';

// Découverte des chiens
export {
  DogProfile,
  type DogProfilePark,
  type DogProfileProps,
} from './discovery/dog-profile';
export { MATCH_CARD_RADIUS, MatchCard, type MatchCardProps } from './discovery/match-card';
export { SwipeActions, type SwipeActionsProps } from './discovery/swipe-actions';

// Profil
export { CompletionCard, type CompletionCardProps } from './profile/completion-card';
export { DogRow, type DogRowProps } from './profile/dog-row';
export { MenuRow, type MenuRowProps } from './profile/menu-row';
export { MenuSection, type MenuSectionProps } from './profile/menu-section';
export { ParkRow, type ParkRowProps } from './profile/park-row';
export {
  ProfileSummaryCard,
  type ProfileSummaryCardProps,
} from './profile/profile-summary-card';

// Onboarding
export {
  OnboardingStepPage,
  type OnboardingStepPageProps,
} from './onboarding/onboarding-step-page';
export { OnboardingSteps, type OnboardingStepsProps } from './onboarding/onboarding-steps';
