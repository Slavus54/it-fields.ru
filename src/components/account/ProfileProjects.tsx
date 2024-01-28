import {useState, useMemo} from 'react';
import {useMutation, gql} from '@apollo/react-hooks';
//@ts-ignore
import Centum from 'centum.js'
import {PROJECT_TYPES, LANGUAGES} from '../../env/env'
import DataPagination from '../UI&UX/DataPagination'
import CloseIt from '../UI&UX/CloseIt'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import ProjectLikesGrades from '../UI&UX/ProjectLikesGrades'
import {AccountPageComponentProps} from '../../types/types'

const ProfileProjects = ({profile, context}: AccountPageComponentProps) => {
    const [projects, setProjects] = useState<any[]>([])
    const [project, setProject] = useState<any | null>(null)
    const [image, setImage] = useState<string>('')
    const [state, setState] = useState({
        title: '', 
        category: PROJECT_TYPES[0], 
        language: LANGUAGES[0], 
        url: ''
    })

    const centum = new Centum()

    const {title, category, language, url} = state

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

    useMemo(() => {
        setImage(project === null ? '' : project.image)
    }, [project])

    const onManageProject = (option: string) => {
        manageProfileProject({
            variables: {
                account_id: context.account_id, option, title, category, language, url, image, coll_id: project === null ? '' : project.shortid 
            }
        })
    }
 
    return (
        <>
            {project === null ?
                    <>
                        <h2>Новый проект</h2>
                    
                        <h4 className='pale'>Название</h4>
                        <textarea value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Опишите это...' />
                    
                        <h4 className='pale'>Ссылка</h4>
                        <input value={url} onChange={e => setState({...state, url: e.target.value})} placeholder='Где посмотреть?' type='text' />
                       
                        <h4 className='pale'>Тип</h4>
                        <div className='items small'>
                            {PROJECT_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                        <h4 className='pale'>Язык</h4>
                        <select value={language} onChange={e => setState({...state, language: e.target.value})}>
                            {LANGUAGES.map(el => <option value={el}>{el}</option>)}
                        </select>
                        <ImageLoader setImage={setImage} />
                        <button onClick={() => onManageProject('create')}>Опубликовать</button>

                        <DataPagination initialItems={profile.projects} setItems={setProjects} />
                        <div className='items half'>
                            {projects.map(el => 
                                <div onClick={() => setProject(el)} className='item card'>
                                    <h4>{centum.shorter(el.title)}</h4>
                                </div>    
                            )}
                        </div>
                    </>
                :
                    <>
                        <CloseIt onClick={() => setProject(null)} />
                        {image !== '' && <ImageLook src={image} className='photo_item' alt='project photo' />}
                        <h2 className='text'>{project.title}</h2>

                        <div className='items little'>
                            <h4 className='pale'>Тип: {project.category}</h4>
                            <h4 className='pale'>Язык: {project.language}</h4>
                        </div>

                        <div className='items smallest'>
                            <ProjectLikesGrades likes={project.likes} />
                            <h4 className='pale'><b>{project.likes}</b> лайков</h4>
                        </div>
                    
                        <ImageLoader setImage={setImage} />

                        <div className='items small'>
                            <button onClick={() => onManageProject('delete')}>Удалить</button>
                            <button onClick={() => onManageProject('update')}>Обновить</button>
                        </div>
                    </>
            }
        </> 
    )
}

export default ProfileProjects