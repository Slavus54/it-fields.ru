import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {FIELDS, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import MapPicker from '../UI&UX/MapPicker'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'
import {TownType, Cords} from '../../types/types'

const Profiles: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [filtered, setFiltered] = useState<any[]>([])
    const [profiles, setProfiles] = useState<any[] | null>(null)
    const [username, setUsername] = useState<string>('')
    const [field, setField] = useState<string>(FIELDS[0])
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<Cords>(towns[0].cords)

    const centum = new Centum()

    const getProfilesM = gql`
        mutation getProfiles($username: String!) {
            getProfiles(username: $username) {
                account_id
                username
                field
                course
                region
                cords {
                    lat
                    long
                }
            }
        }
    `

    const [getProfiles] = useMutation(getProfilesM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProfiles)
            setProfiles(data.getProfiles)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProfiles({
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
        if (profiles !== null) {
            let result = profiles.filter(el => el.field === field)

            if (username !== '') {
                result = result.filter(el => centum.search(el.username, username, SEARCH_PERCENT))
            }

            result = result.filter(el => el.region === region)

            setFiltered(result)
        }
    }, [profiles, username, field, region])

    return (
        <>          
            <h2>Найдите IT-друзей</h2>
            <textarea value={username} onChange={e => setUsername(e.target.value)} placeholder='Имя пользователя' />

            <select value={field} onChange={e => setField(e.target.value)}>
                {FIELDS.map(el => <option value={el}>{el}</option>)}
            </select>
 
            <h4 className='pale'>Где находится?</h4>
            <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Название города' type='text' />

            <DataPagination initialItems={filtered} setItems={setFiltered} />

            {profiles !== null &&
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    {filtered.map(el => 
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id={el.account_id} isRedirect={true}>
                                {el.username}
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>  
            }

            {profiles === null && <Loading loadingLabel='пользователей' />}
        </>
    )
}

export default Profiles