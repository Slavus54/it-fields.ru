import {useState, useMemo} from 'react'
import {GITHUB_API, CODEWARS_API} from '../../env/env'
import {GithubInfoProps} from '../../types/types'

const ProfileAPIInfo: React.FC<GithubInfoProps> = ({link_content, link_type = 'Github'}) => {
    const [page, setPage] = useState<any | null>(null)

    const get_page = async () => {
        let base: string = link_type === 'Github' ? GITHUB_API : CODEWARS_API
        let response = await fetch(base+link_content)
      
        let result = await response.json()

        if (result !== null) {
            setPage(result)
        }
    }

    useMemo(async () => {
        await get_page()
    }, [])

    return (
        <>
            {page !== null && link_type === 'Github' &&
                <div className='items small'>
                    <h5 className='pale'>Репозиториев: <b>{page.public_repos}</b></h5>
                    <h5 className='pale'><b>{page.followers}</b> подписчиков</h5>
                </div>
            }

            {page !== null && link_type === 'CodeWars' &&
                <div className='items small'>
                    <h5 className='pale'>Ранг: {page.ranks?.overall?.name}</h5>
                    <h5 className='pale'><b>{page.honor}</b> опыта</h5>
                </div>
            }
        </>
    )
}   

export default ProfileAPIInfo