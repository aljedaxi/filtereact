import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
// import { Tree as TreeType } from '../../parser';

// component imports
import Navbar from './Navbar';
import Tree from './Tree';
import Flow from './Flow';

const Sidebar = () => {
  // state variables for the incomimg treeData, parsed viewData, user's settings, and the root file name
  const [treeData, setTreeData]: any = useState();
  const [viewData, setViewData]: any = useState();
  const [settings, setSettings]: [{ [key: string]: boolean }, Function] =
    useState();
  const [rootFile, setRootFile]: [string | undefined, Function] = useState();

  // useEffect whenever the Sidebar is rendered
  useEffect(() => {
    // Event Listener for 'message' from the extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        // Listener to receive the tree data, update navbar and tree view
        case 'parsed-data': {
          setRootFile(message.value.fileName);
          setTreeData([message.value]);
          // console.log('HERE', treeData);
          break;
        }
        // Listener to receive the user's settings
        case 'settings-data': {
          setSettings(message.value);
          break;
        }
      }
    });

    // Post message to the extension whenever sapling is opened
    tsvscode.postMessage({
      type: 'onSaplingVisible',
      value: null,
    });

    // Post message to the extension for the user's settings whenever sapling is opened
    tsvscode.postMessage({
      type: 'onSettingsAcquire',
      value: null,
    });
    // console.log('HERE', viewData);
  }, []);

  // Separate useEffect that gets triggered when the treeData and settings state variables get updated
  useEffect(() => {
    if (treeData && settings) {
      // Invoke parser to parse based on user's settings
      parseViewTree();
    }
  }, [treeData, settings]);

  const initialNodes: Node[] = [];
  let id = 0;
  let xPos = 25;
  let yPos = 200;
  const nodeGap = 100;

  const getNodes = (tree: any) => {
    if (!tree) {
      return;
    }
    let count = 0;
    tree.forEach((item: any) => {
      const node = {
        id: (++id).toString(),
        data: {
          label: (
            <div>
              <strong>{item.fileName}</strong>
              {Object.keys(item.props).length > 0 && (
                <>
                  <hr />
                  {Object.keys(item.props).map((prop: any, idx: number) => (
                    <div key={idx}>{prop}</div>
                  ))}
                </>
              )}
            </div>
          ),
        },
        position: {
          x: xPos + count++ * 250,
          y: yPos + item.depth * nodeGap,
        },
      };
      initialNodes.push(node);
      if (item.children) {
        getNodes(item.children);
      }
    });
  };

  // Edits and returns component tree based on users settings
  const parseViewTree = (): void => {
    // Deep copy of the treeData passed in
    const treeParsed = JSON.parse(JSON.stringify(treeData[0]));

    // Helper function for the recursive parsing
    const traverse = (node: any): void => {
      let validChildren = [];

      // Logic to parse the nodes based on the users settings
      for (let i = 0; i < node.children.length; i++) {
        if (
          node.children[i].thirdParty &&
          settings.thirdParty &&
          !node.children[i].reactRouter
        ) {
          validChildren.push(node.children[i]);
        } else if (node.children[i].reactRouter && settings.reactRouter) {
          validChildren.push(node.children[i]);
        } else if (
          !node.children[i].thirdParty &&
          !node.children[i].reactRouter
        ) {
          validChildren.push(node.children[i]);
        }
      }

      // Update children with only valid nodes, and recurse through each node
      node.children = validChildren;
      node.children.forEach((child: any) => {
        traverse(child);
      });
    };

    // Invoking the helper function
    traverse(treeParsed);
    // Update the vewData state
    setViewData([treeParsed]);
    console.log(viewData);

    // getNodes(viewData);
    // console.log('HERE', initialNodes);
  };

  // const initialNodes: Node[] = [
  //   {
  //     id: '1',
  //     type: 'input',
  //     data: { label: 'Root dsfasdf' },
  //     position: { x: 250, y: 5 },
  //   },
  //   {
  //     id: '2',
  //     data: { label: 'Node 2' },
  //     position: { x: 100, y: 100 },
  //   },
  //   {
  //     id: '3',
  //     data: { label: 'Node 3' },
  //     position: { x: 400, y: 100 },
  //   },
  //   {
  //     id: '4',
  //     data: { label: 'Node 4' },
  //     position: { x: 400, y: 200 },
  //     type: 'custom',
  //   },
  // ];

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
    { id: 'e3-4', source: '3', target: '4', animated: false },
  ];

  getNodes(viewData);

  const data = initialNodes;
  console.log('HERE', data);

  // const [nodes, setNodes, onNodesChange] = useNodesState(data);
  // // console.log('DESTRUCTURED NODES', nodes);
  // console.log('INITIAL NODES ARRAY', data);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  // const onConnect = useCallback(
  //   (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
  //   [setEdges]
  // );

  // Render section
  return (
    <div className="sidebar">
      <Navbar rootFile={rootFile} />    
      <hr className="line_break" />
      {/* <div>
        {viewData && viewData[0].children.map((node: any) => <div>{node.name}</div>)}
      </div> */}
      {/* <div className="tree_view">
        <ul className="tree_beginning">
          {viewData && settings ? <Tree data={viewData} first={true} /> : null}
        </ul>
      </div> */}
      {/* {initialNodes.length !== 0 ? ( */}
      {/* <div className="tree_view">
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          // nodeTypes={nodeTypes}
        />
      </div> */}
      {/* ): null} */}
      <Flow data={data} />
    </div>
  );
};

export default Sidebar;
