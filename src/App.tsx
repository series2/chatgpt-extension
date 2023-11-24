import { useEffect, useState } from "react";
import { Trash3, FolderPlus } from "react-bootstrap-icons";
type chats = Array<file | directory>;
interface file {
  class: "file";
  name: string;
  content: string;
}
interface directory {
  class: "directory";
  name: string;
  content: chats;
}

function App(): JSX.Element {
  //   const initChats: chats = [
  //     {
  //       class: 'directory',
  //       name: 'Coffee1',
  //       content: [
  //         {
  //           class: 'directory',
  //           name: 'Coffee2',
  //           content: [

  //           ]
  //         },
  //         { class: 'file', name: 'Cofee3', content: 'id' }
  //       ]
  //     },
  //     { class: 'file', name: '音声', content: 'another id' }
  //   ]

  function checkExistId(id: string, curpath: chats): boolean {
    if (curpath.length === 0) {
      return false;
    }
    for (let i = 0; i < curpath.length; i++) {
      if (curpath[i].class === "file") {
        // // console.log(curpath[i].name)
        if (curpath[i].content === id) {
          return true;
        }
      } else {
        if (checkExistId(id, curpath[i].content as chats)) {
          return true;
        }
      }
    }
    return false;
  }

  const [rootChats, setChats] = useState<chats>([]);
  const [url, setURL] = useState<string>(location.href);
  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (url !== location.href && location.href.split("/").length === 5) {
        observer.disconnect();

        const id = location.href.split("/")[4];
        if (!checkExistId(id, rootChats)) {
          named(id);
        }
        setURL(location.href);

        observer.observe(document.getElementsByTagName("nav")[0].children[1], {
          childList: true,
          subtree: true,
        });
      }
    });
    observer.observe(document.getElementsByTagName("nav")[0].children[1], {
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
    };
  }, [rootChats, url]);

  function named(id: string): void {
    const newpath = window.prompt(
      "新しいチャットを検出。保存パスを記述(空文字で無視) : /"
    );
    if (newpath == null) {
      // console.log('cancel')
      return;
    }
    if (newpath === "") {
      // console.log('何も作成されず')
      return;
    }
    for (let i = 0; i < newpath.split("/").length; i++) {
      if (newpath.split("/")[i] === "") {
        alert("pathが不正です");
        return;
      }
    }
    // console.log('named start chats', rootChats, 'new', newpath)
    addDirRecursive(newpath.split("/"), rootChats, true, id);
    // console.log('named end')
  }

  function init(): void {
    chrome.storage.local.get("chats", function (value) {
      if (value.chats === null || value.chats === undefined) {
        setChats([]);
      } else {
        setChats(value.chats);
      }
    });
    // chrome.storage.local.set({ chats: oldChats }).then(() => {
    //   chrome.storage.local.get('chats', function (value) {
    //     setChats(value.chats)
    //   })
    // }).catch(() => {})// debug用
  }

  function addDirRecursive(
    targetPath: string[],
    curpath: chats,
    targetIsFile: boolean = false,
    id: string = "",
    remove: boolean = false
  ): void {
    if (targetPath.length === 0) {
      // console.log('set', rootChats)
      setChats([...rootChats]);
      chrome.storage.local.set({ chats: rootChats }).catch(() => {});
      return;
    }
    // targetpath[0]がcurpath以下にないか
    for (let i = 0; i < curpath.length; i++) {
      if (curpath[i].name === targetPath[0]) {
        if (
          remove &&
          !targetIsFile &&
          curpath[i].class === "directory" &&
          targetPath.length === 1
        ) {
          // console.log('logging', curpath[i].content, targetPath)
          if (
            (curpath[i].content.length > 0 &&
              window.confirm(
                "以下のDir構造を全て消します。(チャット履歴は消しません)"
              )) ||
            curpath[i].content.length === 0
          ) {
            curpath.splice(i, 1);
            // console.log('Dir remove sucseeded')
            setChats([...rootChats]);
            chrome.storage.local.set({ chats: rootChats }).catch(() => {});
          } else {
            // console.log('Dir remove failed')
          }
        } else if (
          curpath[i].class === "directory" &&
          !(targetIsFile && targetPath.length === 1)
        ) {
          addDirRecursive(
            targetPath.slice(1),
            curpath[i].content as chats,
            targetIsFile,
            id,
            remove
          );
          return;
        } else if (
          remove &&
          targetIsFile &&
          curpath[i].class === "file" &&
          targetPath.length === 1
        ) {
          curpath.splice(i, 1);
          // console.log('File remove sucseeded')
          setChats([...rootChats]);
          chrome.storage.local.set({ chats: rootChats }).catch(() => {});
          return;
        } else {
          alert("pathが不正です");
          return;
        }
      }
    }
    // 以下はragetpath[0]がcurpathに存在しない場合をあらわす。
    if (remove) {
      // console.log(targetPath, curpath)
      // console.log('削除対象は見つかりません')
    } else if (targetIsFile && targetPath.length === 1) {
      // console.log('log', targetPath, rootChats, curpath)
      const n: file = {
        class: "file",
        name: targetPath[0],
        content: id,
      };
      curpath.push(n);
      // console.log('set', rootChats)
      setChats([...rootChats]);
      chrome.storage.local.set({ chats: rootChats }).catch(() => {});
    } else {
      // console.log('new dir', targetPath[0])
      const n: directory = {
        class: "directory",
        name: targetPath[0],
        content: [],
      };
      curpath.push(n);
      addDirRecursive(targetPath.slice(1), n.content, targetIsFile, id, remove);
    }
  }
  function addDir(path: string): void {
    const newpath = window.prompt("新しいdir : " + path + "/");
    if (newpath == null) {
      // console.log('cancel')
      return;
    }
    if (newpath === "") {
      alert("pathが不正です");
      return;
    }
    for (let i = 0; i < newpath.split("/").length; i++) {
      if (newpath.split("/")[i] === "") {
        alert("pathが不正です");
        return;
      }
    }

    addDirRecursive(((path + "/").slice(1) + newpath).split("/"), rootChats);
  }

  function icClick(id: string): void {
    const as = document.getElementsByTagName("a");
    for (let i = 0; i < as.length; i++) {
      if (new URL(as[i].href).pathname.substring(3) === id) {
        const el = as[i].children[0] as HTMLElement;
        el.click();
        return;
      }
    }
    // console.log('No element id : ' + id)
  }
  function reset(): void {
    if (window.confirm("Dir構造を全て消します。(チャット履歴は消しません)")) {
      setChats([]);
      chrome.storage.local.set({ chats: [] }).catch(() => {});
    }
  }
  function showChats(chats: chats, space: number = 0, path = ""): JSX.Element {
    return (
      <ul>
        {chats.map((item) => {
          if (item.class === "directory") {
            return (
              <li key={item.name}>
                <button style={{ width: "85%", textAlign: "left" }}>
                  <p
                    className="dark"
                    style={{
                      paddingLeft: space,
                      width: "90%",
                      textAlign: "left",
                    }}
                  >
                    {item.name}{" "}
                  </p>
                </button>
                <button
                  onClick={() => {
                    addDir(path + "/" + item.name);
                  }}
                >
                  <FolderPlus className="item-center"></FolderPlus>
                </button>
                <button
                  onClick={() => {
                    addDirRecursive(
                      ((path + "/").slice(1) + item.name).split("/"),
                      rootChats,
                      false,
                      "",
                      true
                    );
                  }}
                >
                  <Trash3 className="item-center"></Trash3>
                </button>
                {showChats(item.content, space + 10, path + "/" + item.name)}
              </li>
            );
          } else {
            const id: string =
              url.split("/").length === 5 ? url.split("/")[4] : "";
            let className: string =
              id === item.content
                ? "bg-token-surface-primary"
                : "hover:bg-token-surface-primary hover:";
            className += " items-center rounded-lg";
            return (
              <li key={item.name}>
                <button
                  className={className}
                  style={{ width: "90%", textAlign: "left" }}
                  onClick={() => {
                    icClick(item.content);
                  }}
                >
                  <p className="dark" style={{ paddingLeft: space }}>
                    {item.name}
                  </p>
                </button>
                <button
                  onClick={() => {
                    addDirRecursive(
                      ((path + "/").slice(1) + item.name).split("/"),
                      rootChats,
                      true,
                      "",
                      true
                    );
                  }}
                >
                  <Trash3 className="item-center"></Trash3>
                </button>
              </li>
            );
          }
        })}
      </ul>
    );
  }

  return (
    <>
      <h2>
        Extension
        <button
          onClick={() => {
            addDir("");
          }}
        >
          <FolderPlus className="item-center"></FolderPlus>
        </button>
        <button
          onClick={() => {
            reset();
          }}
        >
          <Trash3 className="item-center"></Trash3>
        </button>
      </h2>
      {showChats(rootChats)}
    </>
  );
}

export default App;
