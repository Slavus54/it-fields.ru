import {useState, useMemo, useContext} from 'react';
import {useMutation, gql} from '@apollo/react-hooks';
import {Context} from '../../context/WebProvider'
import Loading from '../UI&UX/Loading'
import ImageLook from '../UI&UX/ImageLook'
import components, {default_component} from '../account/index'

const AccountPage = () => {
    const {change_context, context} = useContext(Context)
    const [profile, setProfile] = useState(null)
    const [page, setPage] = useState(default_component)

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
    
    const [getProfile] = useMutation(getProfileM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getProfile)

            if (data.getProfile === null) {
                change_context('update', null)
            } else {
                setProfile(data.getProfile)
            }
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getProfile({
                variables: {
                    account_id: context.account_id
                }
            })
        }
    }, [context.account_id])
    
    return (
        <>
            {profile !== null && 
                <>
                    <div className='sidebar'>
                        {components.map((el, key) => <ImageLook onClick={() => setPage(el)} src={el.icon} min={2} max={2} className='icon sidebar__item' alt='icon' key={key} />)}
                    </div>

                    {page !== null && <page.component profile={profile} context={context} />}                 
                </>
            }

            {profile === null && <Loading loadingLabel='профиля' />}
        </>
    )
}

export default AccountPage