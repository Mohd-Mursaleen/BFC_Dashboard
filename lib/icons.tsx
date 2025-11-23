import { 
  FaUsers, 
  FaUserPlus,
  FaClipboardList, 
  FaFileContract,
  FaWhatsapp,
  FaCog,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPauseCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaChartBar,
  FaChartPie,
  FaTrophy,
  FaClock,
  FaPhone,
  FaCalendarAlt,
  FaUserFriends,
  FaMale,
  FaFemale,
  FaChartLine,
  FaBell,
  FaSearch,
  FaFilter,
  FaPlay,
  FaStop,
  FaTimes
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { HiOutlineRefresh } from 'react-icons/hi';
import { IoMdCheckmarkCircle } from 'react-icons/io';

export const Icons = {
  // Navigation
  dashboard: MdDashboard,
  members: FaUsers,
  plans: FaClipboardList,
  subscriptions: FaFileContract,
  whatsapp: FaWhatsapp,
  scheduler: FaCog,
  
  // Actions
  addMember: FaUserPlus,
  refresh: FaSyncAlt,
  search: FaSearch,
  filter: FaFilter,
  play: FaPlay,
  stop: FaStop,
  
  // Status
  active: FaCheckCircle,
  paused: FaPauseCircle,
  expired: FaTimesCircle,
  warning: FaExclamationTriangle,
  success: IoMdCheckmarkCircle,
  
  // Metrics
  revenue: FaMoneyBillWave,
  trophy: FaTrophy,
  clock: FaClock,
  calendar: FaCalendarAlt,
  
  // Charts
  chartBar: FaChartBar,
  chartPie: FaChartPie,
  chartLine: FaChartLine,
  
  // Demographics
  male: FaMale,
  female: FaFemale,
  userFriends: FaUserFriends,
  
  // Communication
  phone: FaPhone,
  bell: FaBell,
  close: FaTimes,
};

export type IconName = keyof typeof Icons;
