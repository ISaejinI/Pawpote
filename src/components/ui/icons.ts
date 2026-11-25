import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import ArrowRight from '@/assets/icons/arrow-right.svg';
import Back from '@/assets/icons/back.svg';
import Bell from '@/assets/icons/bell.svg';
import Cake from '@/assets/icons/cake.svg';
import Calendar from '@/assets/icons/calendar.svg';
import Camera from '@/assets/icons/camera.svg';
import Check from '@/assets/icons/check.svg';
import CheckDouble from '@/assets/icons/check-double.svg';
import ChevronDown from '@/assets/icons/chevron-down.svg';
import ChevronRight from '@/assets/icons/chevron-right.svg';
import Clock from '@/assets/icons/clock.svg';
import Close from '@/assets/icons/close.svg';
import Distance from '@/assets/icons/distance.svg';
import Expand from '@/assets/icons/expand.svg';
import Eye from '@/assets/icons/eye.svg';
import EyeOff from '@/assets/icons/eye-off.svg';
import Female from '@/assets/icons/female.svg';
import Filters from '@/assets/icons/filters.svg';
import Gallery from '@/assets/icons/gallery.svg';
import Heart from '@/assets/icons/heart.svg';
import Help from '@/assets/icons/help.svg';
import Key from '@/assets/icons/key.svg';
import Lock from '@/assets/icons/lock.svg';
import LogOut from '@/assets/icons/log-out.svg';
import LogoPaw from '@/assets/icons/logo-paw.svg';
import Mail from '@/assets/icons/mail.svg';
import Male from '@/assets/icons/male.svg';
import Park from '@/assets/icons/park.svg';
import Paw from '@/assets/icons/paw.svg';
import Pencil from '@/assets/icons/pencil.svg';
import Pin from '@/assets/icons/pin.svg';
import PinFilled from '@/assets/icons/pin-filled.svg';
import Plus from '@/assets/icons/plus.svg';
import ProposeWalk from '@/assets/icons/propose-walk.svg';
import Search from '@/assets/icons/search.svg';
import Send from '@/assets/icons/send.svg';
import Smile from '@/assets/icons/smile.svg';
import Sparkle from '@/assets/icons/sparkle.svg';
import Swap from '@/assets/icons/swap.svg';
import TabMatch from '@/assets/icons/tab-match.svg';
import TabMessages from '@/assets/icons/tab-messages.svg';
import TabProfile from '@/assets/icons/tab-profile.svg';
import Trash from '@/assets/icons/trash.svg';
import User from '@/assets/icons/user.svg';

/**
 * Icônes d'interface : monochromes (`currentColor`), elles prennent la couleur `color`.
 * Pour ajouter une icône : déposer le .svg dans assets/icons/, l'importer ici et l'ajouter à la liste.
 */
const interfaceIcons = {
  'arrow-right': ArrowRight,
  'back': Back,
  'bell': Bell,
  'cake': Cake,
  'calendar': Calendar,
  'camera': Camera,
  'check': Check,
  'check-double': CheckDouble,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'clock': Clock,
  'close': Close,
  'distance': Distance,
  'expand': Expand,
  'eye': Eye,
  'eye-off': EyeOff,
  'female': Female,
  'filters': Filters,
  'gallery': Gallery,
  'heart': Heart,
  'help': Help,
  'key': Key,
  'lock': Lock,
  'log-out': LogOut,
  'mail': Mail,
  'male': Male,
  'park': Park,
  'paw': Paw,
  'pencil': Pencil,
  'pin': Pin,
  'pin-filled': PinFilled,
  'plus': Plus,
  'propose-walk': ProposeWalk,
  'search': Search,
  'send': Send,
  'smile': Smile,
  'sparkle': Sparkle,
  'swap': Swap,
  'trash': Trash,
  'user': User,
} satisfies Record<string, FC<SvgProps>>;

/** Illustrations multicolores : leurs couleurs sont fixes, `color` n'a pas d'effet. */
const illustrations = {
  'logo-paw': LogoPaw,
  'tab-match': TabMatch,
  'tab-messages': TabMessages,
  'tab-profile': TabProfile,
} satisfies Record<string, FC<SvgProps>>;

export const icons = { ...interfaceIcons, ...illustrations };

export type IconName = keyof typeof icons;
