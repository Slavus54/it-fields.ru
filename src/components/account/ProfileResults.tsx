import {useState, useMemo} from 'react';
import {useMutation, gql} from '@apollo/react-hooks';
//@ts-ignore
import Centum from 'centum.js'
import {RESULT_TYPES, MARK_GRADES, SEMESTER_LIMIT} from '../../env/env'
import DataPagination from '../UI&UX/DataPagination'
import CloseIt from '../UI&UX/CloseIt'
import QuantityLabel from '../UI&UX/QuantityLabel'
import {AccountPageComponentProps} from '../../types/types'

const ProfileResults = ({profile, context}: AccountPageComponentProps) => {
    const [results, setResults] = useState<any[]>([])
    const [result, setResult] = useState<any | null>(null)
    const [semester, setSemester] = useState<number>(1)
    const [state, setState] = useState({
        title: '', 
        category: RESULT_TYPES[0], 
        format: '', 
        percent: 50
    })

    const centum = new Centum()

    const {title, category, format, percent} = state

    const manageProfileResultM = gql`
        mutation manageProfileResult($account_id: String!, $option: String!, $title: String!, $category: String!, $semester: Float!, $format: String!, $percent: Float!, $coll_id: String!) {
            manageProfileResult(account_id: $account_id, option: $option, title: $title, category: $category, semester: $semester, format: $format, percent: $percent, coll_id: $coll_id)
        }
    `

    const [manageProfileResult] = useMutation(manageProfileResultM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageProfileResult)
            window.location.reload()
        }
    })

    useMemo(() => {
        let filtered = MARK_GRADES.filter(el => el.percent <= percent)

        if (filtered[filtered.length - 1] !== undefined) {
            setState({...state, format: filtered[filtered.length - 1].title})
        }
    }, [percent])

    const onManageResult = (option: string) => {
        manageProfileResult({
            variables: {
                account_id: context.account_id, option, title, category, semester, format, percent, coll_id: result === null ? '' : result.shortid
            }
        })
    }
 
    return (
        <>
            {result === null ?
                    <>
                        <h2>Новый результат</h2>
                    
                        <h4 className='pale'>Название</h4>
                        <textarea value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Наименование дисциплины...' />
                       
                        <h4 className='pale'>Тип</h4>
                        <div className='items small'>
                            {RESULT_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>

                        <h4 className='pale'>Оценка: {percent}%</h4>
                        <input value={percent} onChange={e => setState({...state, percent: parseInt(e.target.value)})} type='range' step={1} />

                        <QuantityLabel num={semester} setNum={setSemester} part={1} min={1} max={SEMESTER_LIMIT} label={`Семестр: ${semester}`} />
                        <button onClick={() => onManageResult('create')}>Опубликовать</button>

                        <DataPagination initialItems={profile.results} setItems={setResults} />
                        <div className='items half'>
                            {results.map(el => 
                                <div onClick={() => setResult(el)} className='item card'>
                                    <h4>{centum.shorter(el.title)}</h4>
                                </div>    
                            )}
                        </div>
                    </>
                :
                    <>
                        <CloseIt onClick={() => setResult(null)} />

                        <h2 className='text'>{result.title}</h2>

                        <div className='items small'>
                            <h4 className='pale'>Тип: {result.category}</h4>
                            <h4 className='pale'>Семестр: {result.semester}</h4>
                        </div>              

                        <h4 className='pale'>Оценка: {result.format} ({result.percent}%)</h4>
             
                        <button onClick={() => onManageResult('delete')}>Удалить</button>
                       
                    </>
            }
        </> 
    )
}

export default ProfileResults