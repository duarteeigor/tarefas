import { type GetServerSideProps } from "next";
import style from "./styles.module.css";
import { getSession } from "next-auth/react";

export default function Dashboard(){
    return(
        <div>
            <h1>Painel dashboard</h1>
        </div>
    )
}

export const getServerSideProps : GetServerSideProps = async ({req}) =>{
    const session = await getSession({req});
    console.log(session?.user)
    
    if(!session?.user){
        return{
            redirect: {
                destination:"/",
                permanent: false
            }
        }
    }

    return {
        props: {
            session,
        }
    }
}