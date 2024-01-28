import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {FIELDS, ROLES, SEMESTER_LIMIT, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import shortid from 'shortid'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {weekdays_titles} from 'datus.js'
import {gain} from '../../store/ls'
import universities from '../../env/universities.json'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import QuantityLabel from '../UI&UX/QuantityLabel'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType, TownType} from '../../types/types'

const CreatePractice: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [idx, setIdx] = useState<number>(0)
    const [semester, setSemester] = useState<number>(1)
    const [state, setState] = useState({
        title: '', 
        category: FIELDS[0], 
        university: '', 
        faculty: '', 
        invite_code: shortid.generate().toString(), 
        weekday: weekdays_titles[0], 
        region: towns[0].title,
        cords: towns[0].cords, 
        role: ROLES[0]
    })

    const centum = new Centum()

    const {title, category, university, faculty, invite_code, weekday, region, cords, role} = state

    const createPracticeM = gql`
        mutation createPractice($username: String!, $id: String!, $title: String!, $category: String!, $university: String!, $faculty: String!, $semester: Float!, $invite_code: String!, $weekday: String!, $region: String!, $cords: ICord!, $role: String!) {
            createPractice(username: $username, id: $id, title: $title, category: $category, university: $university, faculty: $faculty, semester: $semester, invite_code: $invite_code, weekday: $weekday, region: $region, cords: $cords, role: $role)
        }
    `

    const [createPractice] = useMutation(createPracticeM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createPractice)
            window.location.reload()
        }
    })

    useMemo(() => {
        if (university !== '') {
            let result = universities.find(el => centum.search(el, university, 75))

            if (result !== undefined) {
                setState({...state, university: result})
            }
        }
    }, [university])

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
        createPractice({
            variables: {
                username: context.username, id: params.id, title, category, university, faculty, semester, invite_code, weekday, region, cords, role
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Создайте практику' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Название</h3>
                        <textarea value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название практики' />
                    
                        <h3 className='pale'>Факультет</h3>
                        <input value={faculty} onChange={e => setState({...state, faculty: e.target.value})} placeholder='Вам факультет' type='text' />  
                       
                        <h3 className='pale'>Сфера деятельности</h3>
                        <div className='items small'>
                            {FIELDS.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                        
                        <h3 className='pale'>Выберите роль</h3>
                        <select value={role} onChange={e => setState({...state, role: e.target.value})}>
                            {ROLES.map(el => <option value={el}>{el}</option>)}
                        </select>
                    </>,
                    <>
                        <h3 className='pale'>Университет и семестр</h3>
                        <textarea value={university} onChange={e => setState({...state, university: e.target.value})} placeholder='Название вуза' />
                        <QuantityLabel num={semester} setNum={setSemester} part={1} min={1} max={SEMESTER_LIMIT} label={`Текущий семестр: ${semester}`} />   
                    </>,
                    <>
                        <h3 className='pale'>В какой день и где будут встречи?</h3>
                        <div className='items small'>
                            {weekdays_titles.map((el: string) => <div onClick={() => setState({...state, weekday: el})} className={el === weekday ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
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

export default CreatePractice