import { Component, OnInit, ElementRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Injectable } from "@angular/core";
import * as $ from "node_modules/jquery/dist/jquery.min.js";
import testEdge from "../assets/TestCases.json";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Network, DataSet, Node, Edge, IdType, NodeOptions } from "vis";
import { injectChangeDetectorRef } from "@angular/core/src/render3/view_engine_compatibility";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "AngularGraph";

  public arrEdge = [];
  public arrFlow = [];

  public nodes: DataSet<Node>;
  public edges: DataSet<Edge>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpClient,
    private element: ElementRef
  ) { }
  // tslint:disable-next-line: use-life-cycle-interface
  ngOnInit() {
    this.httpService
      .get("http://localhost:8080/api/flows")
      .subscribe((res: any[]) => {
        this.arrFlow = res;

        // console.log(this.arrFlow);
        this.httpService
          .get("http://localhost:8080/api/edges")
          // tslint:disable-next-line: no-shadowed-variable
          .subscribe((res: any[]) => {
            this.arrEdge = res;
            // console.log(this.arrEdge);
            this.drawGraph();
          });
      });
    $("textarea").append("Logs will be displayed here:\n");
  }

  // Drawing graph function
  public drawGraph(): void {
    this.nodes = new DataSet(this.arrFlow);
    this.edges = new DataSet(this.arrEdge);

    const container = document.getElementById("mynetwork");
    const options = {
      nodes: {
        fixed: {
          x: false,
          y: false
        },
        shadow: {
          enabled: true,
          color: "rgba(0,0,0,0.5)",
          size: 10,
          x: 5,
          y: 5
        },
        color: {
          hover: {
            border: "#2B7CE9",
            background: "#32CD32"
          }
        },
        shape: "circle"
      },
      edges: {
        arrows: { to: { enabled: true, scaleFactor: 1, type: "arrow" } },
        length: 300
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        tooltipDelay: 30
      },
      layout: {
        hierarchical: {
          enabled: true,
          levelSeparation: 200,
          nodeSpacing: 600,
          direction: 'LR'
        }
      },
      physics: {
        enabled: false
      }
    };

    // initialize your network!
    const network = new Network(
      container,
      { nodes: this.nodes, edges: this.edges },
      options
    );
    const x = this.element.nativeElement.querySelector("#test");
    // console.log(network.getSeed());
  }

  // Injecting testcases
  public doSomething(): void {
    // for making the path
    const newarr = [];
    for (let k = 0; k < this.arrEdge.length; k++) {
      newarr.push({
        id: this.arrEdge[k].id.toString(),
        from: this.arrEdge[k].from,
        from_node: this.arrEdge[k].from_node,
        to: this.arrEdge[k].to,
        to_node: this.arrEdge[k].to_node
      });
    }

    let objStrings = newarr.map(x => JSON.stringify(x));
    //console.log(objStrings);

    function check(arr1, arr2) {
      return arr1.some(x => objStrings.includes(JSON.stringify(x)));
    }

    const arrTemp1 = [];
    const arrTemp2 = [];
    for (let i = 0; i < testEdge.length; i++) {
      $("textarea").append("Test case: " + (i + 1) + "\n-------------\n");
      let isSameWithNewArr = testEdge[i].flat().map(function (item) {
        let isSame;
        if (
          objStrings.includes(
            JSON.stringify(item, ["id", "from", "from_node", "to", "to_node"])
          )
        ) {
          isSame = true;
        } else {
          isSame = false;
        }
        return isSame;
      });
      for (let j = 0; j < isSameWithNewArr.length; j++) {
        if (isSameWithNewArr[j] === true) {
          arrTemp1.push({
            id: testEdge[i][j].id,
            status: testEdge[i][j].status,
            flow: testEdge[i][j].flow,
            name: testEdge[i][j].name,
            exp_msg: testEdge[i][j].exp_msg,
          });
          arrTemp2.push(testEdge[i][j].id);
          const fromNodeToBeChanged = this.nodes.get(testEdge[i][j].from);
          // console.log(fromNodeToBeChanged);
          fromNodeToBeChanged.color = {
            background: "#00FF00",
            highlight: { background: "#32CD32" }
          };
          this.nodes.update(fromNodeToBeChanged);
          const toNodeToBeChanged = this.nodes.get(testEdge[i][j].to);

          toNodeToBeChanged.color = {
            background: "#00FF00",
            highlight: { background: "#32CD32" }
          };
          this.nodes.update(toNodeToBeChanged);
          // console.log(newarr[i].id);
          this.edges.update({
            id: testEdge[i][j].id,
            color: { color: "#00FF00", highlight: "#32CD32" }
          });
        } else {
          $("textarea").append(
            "Edge from: " +
            testEdge[i][j].from +
            " to: " +
            testEdge[i][j].to +
            " does not exist.\n"
          );
        }
      }
      $("textarea").append("\n-----------------------------------------\n");
    }

    // console.log(JSON.stringify(arrTemp1));

    let occ = {};
    for (let i = 0; i < arrTemp2.length; i++) {
      if (occ[arrTemp2[i]]) {
        occ[arrTemp2[i]]++;
      } else {
        occ[arrTemp2[i]] = 1;
      }
    }


    let table_start = "<table><tr><th>Flow</th><th>Name</th><th>Exception</th></tr>";
    let title = [];
    // console.log("1 "+title);

    class PassFailCounter {
      id: any;
      Passed: number;
      Failed: number;
      Flow: String;
      Name: String;
      Exp_Name: String;

      constructor(id) {
        this.id = id;
        this.Passed = 0;
        this.Failed = 0;
        this.Name = "";
        this.Flow = "";
        this.Exp_Name = "";
      }

      addPass() {
        this.Passed++;
      }

      addFail() {
        this.Failed++;
      }
    }
    // console.log(arrTemp1);
    let str = JSON.stringify(arrTemp1);

    let data = JSON.parse(str);
    let map = new Map();

    for (let i = 0; i < data.length; i++) {
      if (data[i].status == "Failed") {
        if (title[data[i].id])
          title[data[i].id] += "<tr><td>" + data[i].flow + "</td><td>" + data[i].name + "</td><td>" + data[i].exp_msg + "</td></tr>";
        else
          title[data[i].id] = "<tr><td>" + data[i].flow + "</td><td>" + data[i].name + "</td><td>" + data[i].exp_msg + "</td></tr>";
      }
    }
    console.log(title);

    data.forEach(entry => {
      let exist = map.get(String(entry.id));
      if (!exist) {
        map.set(String(entry.id), new PassFailCounter(String(entry.id)));
        exist = map.get(String(entry.id));
      }
      if (entry.status == "Passed") {
        exist.addPass();
      } else {
        exist.addFail();
      }
    });
    let k = 0;
    for (let i = 0; i < Array.from(map.values()).length; i++) {
      if (Array.from(map.values())[i].Failed == "0") {
        this.edges.update({
          id: Array.from(map.values())[i].id,
          width:
            Array.from(map.values())[i].Passed +
            Array.from(map.values())[i].Failed,
          title:
            "Checked:" +
            (Array.from(map.values())[i].Passed +
              Array.from(map.values())[i].Failed) +
            " Passed:" +
            Array.from(map.values())[i].Passed +
            " Failed:" +
            Array.from(map.values())[i].Failed + "<br>"
        });
      }
      else if (Array.from(map.values())[i].Failed != "0") {
        /* title = title + table;
         console.log(parseInt(Array.from(map.values())[i].Failed));
         console.log("k = "+k);
        for (let j = k; j < parseInt(Array.from(map.values())[i].Failed); j++) {
          if (data[j].status == "Failed") {
            title = title + "<tr><td>" + data[j].flow + "</td><td>" + data[j].name + "</td><td>" + data[j].exp_msg + "</td></tr>";
          }
          console.log("3 "+title);
        }
        console.log("4 "+title); */
        this.edges.update({
          id: Array.from(map.values())[i].id,
          color: { color: "#FF0000" },
          width:
            Array.from(map.values())[i].Passed +
            Array.from(map.values())[i].Failed,
          title:
            "Checked:" +
            (Array.from(map.values())[i].Passed +
              Array.from(map.values())[i].Failed) +
            " Passed:" +
            Array.from(map.values())[i].Passed +
            " Failed:" +
            Array.from(map.values())[i].Failed + "<br>" + table_start + title[parseInt(Array.from(map.values())[i].id)]
        })
        // title = "";
        //console.log("5 "+title);
        k = k + parseInt(Array.from(map.values())[i].Failed) ;
        console.log("k = "+k);
      }
    }
    // console.log(JSON.stringify(Array.from(map.values())[0]));
  }

}
