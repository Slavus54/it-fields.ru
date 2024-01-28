import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {FIELDS, POSITIONS, EXP_LIMIT, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import QuantityLabel from '../UI&UX/QuantityLabel'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType, TownType} from '../../types/types'

const CreateVacancy: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [idx, setIdx] = useState<number>(0)
    const [experience, setExperience] = useState<number>(1)
    const [state, setState] = useState({
        title: '', 
        category: FIELDS[0], 
        position: POSITIONS[0], 
        region: towns[0].title,
        cords: towns[0].cords, 
        url: ''
    })

    const centum = new Centum()

    const {title, category, position, region, cords, url} = state

    const createVacancyM = gql`
        mutation createVacancy($username: String!, $id: String!, $title: String!, $category: String!, $position: String!, $region: String!, $cords: ICord!, $experience: Float!, $url: String!) {
            createVacancy(username: $username, id: $id, title: $title, category: $category, position: $position, region: $region, cords: $cords, experience: $experience, url: $url)
        }
    `

    const [createVacancy] = useMutation(createVacancyM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createVacancy)
            window.location.reload()
        }
    })

    useMemo(() => {
        if (region !== '') {
            let result = towns.find(el => centum.search(el.title, region, SEARCH_PERCENT)) 
    
            if (result !== undefined) {
                setState({...state, region: result.title, cords: result.cords})
            }           
        }
    }, [region])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 17})
    }, [cords])

    const onCreate = () => {
        createVacancy({
            variables: {
                username: context.username, id: params.id, title, category, position, region, cords, experience, url
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Создайте вакансию' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Наименование вакансии от HR</h3>
                        <textarea value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название вакансии' />                       
                       
                        <h3 className='pale'>Должность</h3>
                        <div className='items small'>
                            {POSITIONS.map(el => <div onClick={() => setState({...state, position: el})} className={el === position ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                        
                        <h3 className='pale'>Сфера деятельности</h3>
                        <select value={category} onChange={e => setState({...state, category: e.target.value})}>
                            {FIELDS.map(el => <option value={el}>{el}</option>)}
                        </select>
                    </>,
                    <>
                        <h3 className='pale'>Ссылка на вакансию</h3>
                        <input value={url} onChange={e => setState({...state, url: e.target.value})} placeholder='URL' type='text' />  
                        <QuantityLabel num={experience} setNum={setExperience} part={1} min={0} max={EXP_LIMIT} label={`Опыт: ${experience} лет`} />
                    </>,
                    <>
                        <h3 className='pale'>Где находится?</h3>
                        <input value={region} onChange={e => setState({...state, region: e.target.value})} placeholder='Название города' type='text' />
                        <ReactMapGL onClick={e => setState({...state, cords: centum.mapboxCords(e)})} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                            <Marker latitude={cords.lat} longitude={cords.long}>
                                <MapPicker type='picker' />
                            </Marker>
                        </ReactMapGL> 
                    </>
                ]} 
            />

            <button onClick={onCreate}>Создать</button>
        </div>
    )
}

export default CreateVacancy