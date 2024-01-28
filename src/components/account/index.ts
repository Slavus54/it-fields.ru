import PersonalProfileInfo from './PersonalProfileInfo'
import GeoProfileInfo from './GeoProfileInfo'
import StudyProfileInfo from './StudyProfileInfo'
import ProfileSecurity from './ProfileSecurity'
import ProfileProjects from './ProfileProjects'
import ProfileResults from './ProfileResults'
import ProfileComponents from './ProfileComponents'

import {AccountPageComponentType} from '../../types/types'

const components: AccountPageComponentType[] = [
    {
        title: 'Profile',
        icon: 'https://img.icons8.com/ios/50/edit-user-male.png',
        component: PersonalProfileInfo
    },
    {
        title: 'Location',
        icon: 'https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/external-location-modern-business-and-business-essentials-flatart-icons-outline-flatarticons.png',
        component: GeoProfileInfo
    },
    {
        title: 'Study',
        icon: 'https://img.icons8.com/ios/50/gears--v1.png',
        component: StudyProfileInfo
    },
    {
        title: 'Security',
        icon: 'https://img.icons8.com/dotty/80/security-configuration.png',
        component: ProfileSecurity
    },
    {
        title: 'Projects',
        icon: 'https://img.icons8.com/external-itim2101-lineal-itim2101/64/external-knowledge-online-education-itim2101-lineal-itim2101.png',
        component: ProfileProjects
    },
    {
        title: 'Results',
        icon: 'https://img.icons8.com/carbon-copy/100/task.png',
        component: ProfileResults
    },
    {
        title: 'Components',
        icon: 'https://img.icons8.com/dotty/80/list.png',
        component: ProfileComponents
    }
]

export const default_component = components[0]

export default components