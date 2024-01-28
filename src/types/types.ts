export interface AccountPageComponentProps {
    profile: any,
    context: any
}

export type AccountPageComponentType = {
    title: string
    icon: string
    component: any
}

export type CollectionPropsType = {
    params: {
        id: string
    }
}

export type Cords = {
    lat: number
    long: number
}

export type TownType = {
    title: string
    cords: Cords
}

export type NavigatorWrapperPropsType = {
    children: any
    isRedirect: boolean
    id?: string
    url?: string
}

// UI&UX

export type ImageLookProps = {
    src: any
    className: string
    min?: number
    max?: number
    speed?: number
    onClick?: any
    alt?: string
}

export type BrowserImageProps = {
    url: string,
    alt?: string
}

export type CloseProps = {
    onClick: any
}

export type DataPaginationProps = {
    initialItems: any[]
    setItems: any
    label?: string
}

export type FormPaginationProps = {
    label: string
    num: number
    setNum: any
    items: any[]
}

export type ImageLoaderProps = {
    setImage: any
    label?: string
}

export type QuantityProps = {
    num: number
    setNum: any
    part?: number
    min?: number
    max?: number
    label?:string
}

export type LoadingProps = {
    loadingLabel?: string
}

export type LikeGradeProps = {
    likes: number
}

export type LikeBoxProps = {
    $color: string
    $likes: number 
    $count: number
}

export type InformationPopupProps = {
    text: string
}

export type GithubInfoProps = {
    link_content: string
    link_type: string
}

export type ContextPropsType = {
    account_id: string
    username: string
}