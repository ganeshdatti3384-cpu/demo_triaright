
import React from 'react';
<<<<<<< HEAD
import Pack365Courses from '@/components/Pack365Courses';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


const Pack365 = () => {
  return (
    <><Navbar onOpenAuth={function (type: 'login' | 'register', userType: string): void {
        throw new Error('Function not implemented.');
      }} />
    <Pack365Courses />
    <Footer />
    </>
  )
}

export default Pack365
=======
import Pack365Courses from '../components/Pack365Courses';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Pack365 = () => {
  return(
    <><Navbar onOpenAuth={function (type: 'login' | 'register', userType: string): void {
      throw new Error('Function not implemented.');
    } } />
    <Pack365Courses />
    <Footer />
    </>);
};

export default Pack365;
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
