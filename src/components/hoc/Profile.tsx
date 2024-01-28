import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import ProfilePhoto from '../../assets/profile_photo.jpg'
import ImageLook from '../UI&UX/ImageLook'
import CloseIt from '../UI&UX/CloseIt'
import DataPagination from '../UI&UX/DataPagination'
import ProfileAPIInfo from '../UI&UX/ProfileAPIInfo'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType} from '../../types/types'

const Profile: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [image, setImage] = useState<string>('')
    const [results, setResults] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [project, setProject] = useState<any  | null>(null)
    const [profile, setProfile] = useState<any| null>(null)

    const centum = new Centum()

    const getProfileM = gql`
        mutation getProfile($account_id: String!) {
            getProfile(account_id: $account_id) {
                account_id
                username
                security_code
                link_type
                link_content
                field
                course
                region
                cords {
                    lat
                    long
                }
                main_photo
                projects {
                    shortid
                    title
                    category
                    language
                    url
                    image
                    likes
                }
                results {
                    shortid
                    title
                    category
                    semester
                    format
                    percent
                }
                account_components {
                    shortid
                    title
                    path
                }
            }
        }
    `

    const manageProfileProjectM = gql`
        mutation manageProfileProject($account_id: String!, $option: String!, $title: String!, $category: String!, $language: String!, $url: String!, $image: String!, $coll_id: String!) {
            manageProfileProject(account_id: $account_id, option: $option, title: $title, category: $category, language: $language, url: $url, image: $image, coll_id: $coll_id) 
        }
    `

    const [manageProfileProject] = useMutation(manageProfileProjectM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageProfileProject)
            window.location.reload()
        }
    })

    const [getProfile] = useMutation(getProfileM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProfile)
            setProfile(data.getProfile)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProfile({
                variables: {
                    account_id: params.id
                }
            })
        }
    }, [context.account_id])
    
    useMemo(() => {
        if (profile !== null) {
            setImage(profile.main_photo === '' ? ProfilePhoto : profile.main_photo)
        }
    }, [profile])

    const onConnect = () => {
        centum.go(profile.link_type, profile.link_content)
    }

    const onLikeProject = () => {
        manageProfileProject({
            variables: {
                account_id: params.id, option: 'like', title: '', category: '', language: '', url: '', image: '', coll_id: project.shortid
            }
        })
    }

    return (
        <>         
            {profile !== null && 
                <>
                    <ImageLook src={image} className='photo_item' alt='account photo' />
                    <h1>{profile.username}</h1>
                    <h3 className='pale text'>{profile.field} | {profile.course} курс</h3>

                    {profile.link_type === 'Telegram' ? 
                            <button onClick={onConnect} className='light-btn'>Telegram</button>
                        :
                            <ProfileAPIInfo link_content={profile.link_content} link_type={profile.link_type} />
                    }

                    {project === null ?
                            <>
                                <DataPagination initialItems={profile.projects} setItems={setProjects} label='Список проектов:' />
                                <div className='items half'>
                                    {projects.map(el => 
                                        <div onClick={() => setProject(el)} className='item card'>
                                            {centum.shorter(el.title)}
                                            <h5 className='pale'>{el.category}</h5>
                                        </div>    
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setProject(null)} />
                                {project.image !== '' && <ImageLook src={project.image} className='photo_item' alt='project photo' />}
                                <h2 className='text'>{project.title}</h2>

                                <div className='items small'>
                                    <h4 className='pale'>Тип: {project.category}</h4>
                                    <h4 className='pale'><b>{project.likes}</b> лайков</h4>
                                    <h4 className='pale'>Язык: {project.language}</h4>
                                </div>

                                <button onClick={onLikeProject}>Нравится</button>
                            </>
                    }
                    
                    <DataPagination initialItems={profile.results} setItems={setResults} label='Табель успеваемости:' />
                    <div className='items half'>
                        {results.map(el => 
                            <div className='item panel'>
                                {centum.shorter(el.title)}
                                <div className='items small'>   
                                    <h5 className='pale'>Семестр: {el.semester}</h5>
                                    <h5 className='pale'>Оценка: {el.format}</h5>
                                </div>
                            </div>    
                        )}
                    </div>
                </>
            }

            {profile === null && <Loading loadingLabel='пользователя' />}
        </>
    )
}

export default Profile