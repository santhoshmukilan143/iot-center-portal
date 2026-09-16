'use client';
import {motion} from 'framer-motion';
export default function Reveal({children,className=''}:{children:React.ReactNode;className?:string}){return <motion.div className={className} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.45}}>{children}</motion.div>}
