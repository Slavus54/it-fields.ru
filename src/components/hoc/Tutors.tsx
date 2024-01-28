import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {TUTOR_TYPES, INSTITUTION_TYPES, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import MapPicker from '../UI&UX/MapPicker'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'
import {TownType, Cords} from '../../types/types'

const Tutors: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [filtered, setFiltered] = useState<any[]>([])
    const [tutors, setTutors] = useState<any[] | null>(null)
    const [fullname, setFullname] = useState<string>('')
    const [category, setCategory] = useState<string>(TUTOR_TYPES[0])
    const [institution, setInstitution] = useState<string>(INSTITUTION_TYPES[0])
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<Cords>(towns[0].cords)

    const centum = new Centum()

    const getTutorsM = gql`
        mutation getTutors($username: String!) {
            getTutors(username: $username) {
                shortid
                account_id
                username
                fullname
                category
                institution
                subjects
                region
                cords {
                    lat
                    long
                }
                url
                grade
                image
                quotes {
                    shortid
                    text
                    category
                    subject
                    likes
                }
                reviews {
                    shortid
                    name
                    criterion
                    period
                    rating
                }
            }
        }
    `

    const [getTutors] = useMutation(getTutorsM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getTutors)
            setTutors(data.getTutors)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getTutors({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (region !== '') {
            let result = towns.find(el => centum.search(el.title, region, SEARCH_PERCENT)) 
    
            if (result !== undefined) {
                setRegion(result.title)
                setCords(result.cords)
            }           
        }
    }, [region])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 17})
    }, [cords])

    useMemo(() => {
        if (tutors !== null) {
            let result = tutors.filter(el => el.region === region && el.institution === institution)

            if (fullname !== '') {
                result = result.filter(el => centum.search(el.fullname, fullname, SEARCH_PERCENT))
            }
           
            result = result.filter(el => el.category === category)
          

            setFiltered(result)
        }
    }, [tutors, fullname, category, institution, region])

    return (
        <>          
            <h2>Поиск наставников</h2>
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Полное имя</h4>
                    <input value={fullname} onChange={e => setFullname(e.target.value)} placeholder='Введите имя' type='text' />
                </div>

                <div className='item'>
                    <h4 className='pale'>Местоположение</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Название города' type='text' />
                </div>
            </div>         
       
            <h4 className='pale'>Должность</h4>
            <div className='items small'>
                {TUTOR_TYPES.map(el => <div onClick={() => setCategory(el)} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
            </div>

            <select value={institution} onChange={e => setInstitution(e.target.value)}>
                {INSTITUTION_TYPES.map(el => <option value={el}>{el}</option>)}
            </select>
 
            <DataPagination initialItems={filtered} setItems={setFiltered} />

            {tutors !== null &&
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    {filtered.map(el => 
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id='' isRedirect={false} url={`/tutor/${el.shortid}`}>
                                {centum.shorter(el.fullname, 2)}
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>  
            }

            {tutors === null && <Loading loadingLabel='наставников' />}
        </>
    )
}

export default Tutors