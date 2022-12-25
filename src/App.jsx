import { Fragment, useEffect, useState } from 'react'
import './App.css'

function App() {
	const [dirents, setDirents] = useState([])
	const [currentFolder, setCurrentFolder] = useState('http://localhost:5000')
	useEffect(() => {
		fetch('/api/dirents', { 
			method: 'POST',
			headers: {
			 'Content-Type': 'application/json;charset=utf-8'
			}, 
			body: JSON.stringify( {
				path: currentFolder.match(/http:\/\/localhost:5000(.*)/)[1],
			})
		})
			.then(res => res.json())
			.then(result => { 
				setDirents(result.dirents)
			})
			.catch(err => console.error(err))
	}, [currentFolder])

	const onClickBreadcrumb = index => {
		const newFolder = 'http://localhost:5000' + currentFolder.match(/http:\/\/localhost:5000(.*)/)[1].split('/').slice(0, index+1).join('/')
		setCurrentFolder(newFolder)
	}

	const renderBreadcrumbs = currentFolder.match(/http:\/\/localhost:5000(.*)/)[1].split('/').map((label, index) => {
		if (index === 0) {
			return <button key={`${label}${index}`} className='breadItem' onClick={() => onClickBreadcrumb(index)}>全部</button>
		} else {
			return (
				<Fragment key={`${label}${index}`}>
					<span>&gt;</span>
					<button className='breadItem' onClick={() => onClickBreadcrumb(index)}>{label}</button>
				</Fragment>
			)
		}
	})

	const renderChildren = dirents.map(({ name, isDirectory }) => {
		if (isDirectory) {
			return (
				<div 
					key={name} 
					style={{display: 'inline-block', verticalAlign: 'middle'}} 
					onDoubleClick={() => setCurrentFolder(name)}
				>
					<svg width={200} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
					</svg>
					<p style={{textAlign: 'center'}}>{name.split('/').pop()}</p>
				</div>
			)
		} else if (name.endsWith('.mp4')) {
			return (
				<div style={{display: 'inline-block', verticalAlign: 'middle'}} key={name}>
					<video controls src={name} key={name} />
					<p style={{textAlign: 'center'}}>{name.split('/').pop()}</p>
				</div>
			)
		} else {
			return (
				<div style={{display: 'inline-block', verticalAlign: 'middle'}} key={name}>
					<img src={name} />
					<p style={{textAlign: 'center'}}>{name.split('/').pop()}</p>
				</div>
			)
		}
	})

	return (
		<div>
			<header>
				{renderBreadcrumbs}
			</header>
			<main>
				{renderChildren}
			</main>
			<footer>底部工具栏</footer>
		</div>
	)
}

export default App
