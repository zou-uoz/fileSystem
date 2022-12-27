import { Fragment, useCallback, useEffect, useState } from 'react'
import './App.css'

function App() {
  const [operate, setOperate] = useState('')
  const [dirents, setDirents] = useState([])
  const [clipboard, setClipboard] = useState([])
  const [selected, setSelected] = useState([])
  const [currentFolder, setCurrentFolder] = useState('http://localhost:5000')

  const fetchDirents = useCallback(path => {
    fetch('/api/dirents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        path,
      })
    })
      .then(res => res.json())
      .then(result => {
        setDirents(result.dirents)
      })
      .catch(err => console.error(err))
  }, [])


  useEffect(() => {
    fetchDirents(currentFolder.match(/http:\/\/localhost:5000(.*)/)[1])
  }, [currentFolder, fetchDirents])


  const onClickBreadcrumb = index => {
    const newFolder = 'http://localhost:5000' + currentFolder.match(/http:\/\/localhost:5000(.*)/)[1].split('/').slice(0, index + 1).join('/')
    setCurrentFolder(newFolder)
    setSelected([])
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

  const onClickItem = (event, url) => {
    event.stopPropagation()
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
      if (!selected.includes(url)) {
        setSelected([...selected, url])
      } else {
        setSelected(selected.filter(s => s !== url))
      }
      return
    }

    if (event.shiftKey && !event.ctrlKey && !event.metaKey) {
      const targetIndex = dirents.findIndex(d => d.url === url);
      const lastSelectedIndex = dirents.findIndex(d => d.url === selected[selected.length - 1]);
      if (targetIndex < lastSelectedIndex) {
        setSelected(dirents.slice(targetIndex, lastSelectedIndex + 1).map(d => d.url))
      } else {
        setSelected(dirents.slice(lastSelectedIndex, targetIndex + 1).map(d => d.url))
      }
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      const targetIndex = dirents.findIndex(d => d.url === url);
      const lastSelectedIndex = dirents.findIndex(d => d.url === selected[selected.length - 1]);
      if (targetIndex < lastSelectedIndex) {
        const newSelected = [...new Set([...selected, dirents.slice(targetIndex, lastSelectedIndex + 1).map(d => d.url)])]
        setSelected(newSelected)
      } else {
        const newSelected = [...new Set([...selected, dirents.slice(lastSelectedIndex, targetIndex + 1).map(d => d.url)])]
        setSelected(newSelected)
      }
      return
    }

    if (!selected.includes(url) || selected.length > 1) {
      setSelected([url])
    }
  }

  const onClick = event => {
    if (!event.target.closest('figure')) {
      setSelected([])
    }
  }

  useEffect(() => {
    const onKeyDown = event => {
      if (selected.length > 0) {
        if (event.key === 'Delete') {
          fetch(`/api/remove`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
              selected: selected.map(s => s.match(/http:\/\/localhost:5000(.*)/)[1]),
            })
          })
            .then(res => res.json())
            .then(() => {
              fetchDirents(currentFolder.match(/http:\/\/localhost:5000(.*)/)[1])
            })
            .catch(err => console.error(err))
          return
        }
  
        if (event.code === 'KeyX' && (event.ctrlKey || event.metaKey)) {
          setOperate('cut')
          setClipboard([...selected])
          return
        }
        if (event.code === 'KeyC' && (event.ctrlKey || event.metaKey)) {
          setOperate('copy')
          setClipboard([...selected])
          return
        }
      }

      if (clipboard.length > 0 && event.code === 'KeyV' && (event.ctrlKey || event.metaKey) && (operate === 'cut' || operate === 'copy')) {
        fetch(`/api/${operate}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            clipboard: clipboard.map(s => s.match(/http:\/\/localhost:5000(.*)/)[1]),
            targetFolder: currentFolder.match(/http:\/\/localhost:5000(.*)/)[1],
          })
        })
          .then(res => res.json())
          .then(() => {
            fetchDirents(currentFolder.match(/http:\/\/localhost:5000(.*)/)[1])
          })
          .catch(err => console.error(err))
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    }
  }, [selected, currentFolder, operate, clipboard, fetchDirents])

  const onDoubleClickFolder = url => {
    setCurrentFolder(url)
    setSelected([])
  }

  const renderChildren = dirents.map(({ url, isDirectory }) => {
    if (isDirectory) {
      return (
        <figure
          key={url}
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            cursor: 'default',
            backgroundColor: selected.includes(url) ? '#cce8ff' : 'revert',
            opacity: operate === 'cut' && selected.includes(url) ? '0.5' : '1',
          }}
          onDoubleClick={() => onDoubleClickFolder(url)}
          onClick={(event) => onClickItem(event, url)}
        >
          <svg width={200} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <figcaption style={{ textAlign: 'center' }}>{url.split('/').pop()}</figcaption>
        </figure>
      )
    } else if (url.endsWith('.mp4')) {
      return (
        <figure
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            cursor: 'default',
            backgroundColor: selected.includes(url) ? '#cce8ff' : 'revert',
            opacity: operate === 'cut' && selected.includes(url) ? '0.5' : '1',
          }}
          key={url}
          onClick={(event) => onClickItem(event, url)}
        >
          <video controls src={url} key={url} />
          <figcaption style={{ textAlign: 'center' }}>{url.split('/').pop()}</figcaption>
        </figure>
      )
    } else {
      return (
        <figure
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            cursor: 'default',
            backgroundColor: selected.includes(url) ? '#cce8ff' : 'revert',
            opacity: operate === 'cut' && selected.includes(url) ? '0.5' : '1',
          }}
          key={url}
          onClick={(event) => onClickItem(event, url)}
        >
          <img src={url} alt='图片' />
          <figcaption style={{ textAlign: 'center' }}>{url.split('/').pop()}</figcaption>
        </figure>
      )
    }
  })

  return (
    <div>
      <header>
        {renderBreadcrumbs}
      </header>
      <main onClick={onClick}>
        {renderChildren}
      </main>
      <footer>底部工具栏{selected.join('、')}</footer>
    </div>
  )
}

export default App
