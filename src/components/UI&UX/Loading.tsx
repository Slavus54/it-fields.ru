import React from 'react'
import {LoadingProps} from '../../types/types'

const Loading: React.FC<LoadingProps> = ({loadingLabel = ''}) => 
<>
    <img src='../loading.gif' className='loader' alt='Loading' />
    Загрузка {loadingLabel}...
</>

export default Loading